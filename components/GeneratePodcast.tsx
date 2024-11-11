import { GeneratePodcastProps } from '@/types';
import React, { useState } from 'react';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Loader } from 'lucide-react';
import { useAction, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { v4 as uuidv4 } from 'uuid';
import { useUploadFiles } from '@xixixao/uploadstuff/react';
import { useToast } from '@/hooks/use-toast';

const GeneratePodcast = (props: GeneratePodcastProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0); // State for progress tracking
  const { toast } = useToast();

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const { startUpload } = useUploadFiles(generateUploadUrl);

  const getPodcastAudio = useAction(api.openai.generateAudioAction);
  const getAudioUrl = useMutation(api.podcasts.getUrl);

  // Helper to split text into manageable chunks
  const splitTextIntoChunks = (text: string, maxLength: number) => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: string[] = [];
    let currentChunk = '';

    sentences.forEach((sentence) => {
      if (currentChunk.length + sentence.length > maxLength) {
        chunks.push(currentChunk);
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    });

    if (currentChunk) chunks.push(currentChunk);
    return chunks;
  };

  const generatePodcast = async () => {
    setIsGenerating(true);
    setProgress(0);
    props.setAudio('');

    if (!props.voicePrompt) {
      toast({
        title: 'Please provide a voiceType to generate a podcast',
      });
      setIsGenerating(false);
      return;
    }

    try {
      const chunkSize = 500; 
      const chunks = splitTextIntoChunks(props.voicePrompt, chunkSize);
      const audioBlobs: Blob[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        // Update progress
        setProgress(Math.round(((i + 1) / chunks.length) * 100));

        const response = await getPodcastAudio({
          voice: props.voiceType,
          input: chunk,
        });

        audioBlobs.push(new Blob([response], { type: 'audio/mpeg' }));
      }

      // Merge the audio chunks into one large blob
      const mergedBlob = new Blob(audioBlobs, { type: 'audio/mpeg' });
      const fileName = `podcast-${uuidv4()}.mp3`;
      const file = new File([mergedBlob], fileName, { type: 'audio/mpeg' });

      // Start the upload process
      const uploaded = await startUpload([file]);
      const storageId = (uploaded[0].response as any).storageId;

      props.setAudioStorageId(storageId);

      const audioUrl = await getAudioUrl({ storageId });
      props.setAudio(audioUrl!);

      setIsGenerating(false);
      setProgress(100); // Finalize progress at 100%
      toast({
        title: 'Podcast generated successfully',
      });
    } catch (error) {
      console.log('Error generating podcast', error);
      toast({
        title: 'Error creating a podcast',
        variant: 'destructive',
      });
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-2.5">
        <Label className="text-16 font-bold text-white-1">
          AI Prompt to generate Podcast
        </Label>
        <Textarea
          className="input-class font-light focus-visible:ring-offset-purple-1"
          placeholder="Express yourself!"
          rows={5}
          value={props.voicePrompt}
          onChange={(e) => props.setVoicePrompt(e.target.value)}
        />
      </div>
      <div className="mt-5 w-full max-w-[200px]">
        <Button
          type="submit"
          className="text-16 bg-purple-1 py-4 font-bold text-white-1"
          onClick={generatePodcast}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              Generating ({progress}%)
              <Loader size={20} className="animate-spin ml-2" />
            </>
          ) : (
            'Generate'
          )}
        </Button>
      </div>
      {props.audio && (
        <audio
          controls
          src={props.audio}
          autoPlay
          className="mt-5"
          onLoadedMetadata={(e) => props.setAudioDuration(e.currentTarget.duration)}
        />
      )}
    </div>
  );
};

export default GeneratePodcast;

import { useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const isRecordingSupported: boolean =
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    typeof window.MediaRecorder === 'function';

type RoomParams = {
    roomId: string;
};

export function RecordRoomAudioPage() {
    const { roomId } = useParams<RoomParams>();

    const [isRecording, setIsRecording] = useState(false);
    const recorder = useRef<MediaRecorder | null>(null);
    const intervalRef = useRef<NodeJS.Timeout>(null);


    function createRecorder(audio: MediaStream) {
        recorder.current = new MediaRecorder(audio, {
            mimeType: 'audio/webm',
            audioBitsPerSecond: 64_000,
        });

        recorder.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                // biome-ignore lint/suspicious/noConsole: test
                console.log(event.data);
                uploadAudio(event.data);
            }
        };

        recorder.current.onstart = () => {
            // biome-ignore lint/suspicious/noConsole: test
            console.log('Gravação iniciada!');
        };

        recorder.current.onstop = () => {
            // biome-ignore lint/suspicious/noConsole: test
            console.log('Gravação encerrada/pausada!');
        };

        recorder.current.start();
    }

    async function startRecording() {
        if (!isRecordingSupported) {
            alert('Seu Navegador não suporta gravação!');
            return;
        }
        setIsRecording(true);

        const audio = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44_100,
            },
        });

        createRecorder(audio);

        intervalRef.current = setInterval(() => {
            recorder.current?.stop();
            createRecorder(audio);
        }, 5000);
    }

    function stopRecording() {
        setIsRecording(false);

        if (recorder.current && recorder.current.state !== 'inactive') {
            recorder.current.stop();
        }

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }

    async function uploadAudio(audio: Blob) {
        const formData = new FormData();
        formData.append('file', audio, 'audio.webm');

        await fetch(`http://localhost:3333/rooms/${roomId}/audio`, {
            method: 'POST',
            body: formData,
        });
    }


    if (!roomId) {
        return <Navigate replace to="/" />;
    }

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-3">
            {isRecording ? (
                <Button onClick={stopRecording}>Parar</Button>
            ) : (
                <Button onClick={startRecording}>Gravar áudio</Button>
            )}
            {isRecording ? <p>Gravando...</p> : <p>Pausado</p>}
        </div>
    );
}

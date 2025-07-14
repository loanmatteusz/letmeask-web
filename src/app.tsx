import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CreateRoomPage } from '@/pages/create-room';
import { RoomPage } from '@/pages/room';
import { RecordRoomAudioPage } from './pages/record-room-audio';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<CreateRoomPage />} index />
          <Route element={<RoomPage />} path="/room/:roomId" />
          <Route element={<RecordRoomAudioPage />} path="/room/:roomId/audio" />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

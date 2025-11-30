import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { useGameLogic } from '../features/game';
import * as audiodb from '../features/audio/services/audiodbService';
import * as deezer from '../features/audio/services/deezerService';

// Mock the services
vi.mock('../features/audio/services/audiodbService');
vi.mock('../features/audio/services/deezerService');

// Test component that uses the hook
const TestComponent: React.FC<{ onRender?: (hook: ReturnType<typeof useGameLogic>) => void }> = ({ onRender }) => {
  const hook = useGameLogic();
  React.useEffect(() => {
    onRender?.(hook);
  });
  return <div data-testid="test-component">Test</div>;
};

describe('useGameLogic', () => {
  let hookResult: ReturnType<typeof useGameLogic> | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    hookResult = null;
  });

  describe('getArtists', () => {
    it('should return artists and correct index', async () => {
      const mockArtistNames = ['Artist1', 'Artist2', 'Artist3'];
      const mockArtistsData = [
        { idArtist: '1', strArtist: 'Artist1', strArtistThumb: 'thumb1', strGenre: 'pop' },
        { idArtist: '2', strArtist: 'Artist2', strArtistThumb: 'thumb2', strGenre: 'pop' },
        { idArtist: '3', strArtist: 'Artist3', strArtistThumb: 'thumb3', strGenre: 'pop' },
      ];

      vi.spyOn(audiodb, 'getArtistNamesByGenre').mockReturnValue(mockArtistNames);
      vi.spyOn(audiodb, 'getArtistsDetails').mockResolvedValue(mockArtistsData as any);

      render(<TestComponent onRender={(h) => { hookResult = h; }} />);

      // Wait for hook to be initialized
      await new Promise(resolve => setTimeout(resolve, 0));

      if (!hookResult) {
        throw new Error('Hook not initialized');
      }

      const artistsResult = await hookResult.getArtists('pop', 3);

      expect(artistsResult).not.toBeNull();
      if (artistsResult) {
        expect(artistsResult._artists).toHaveLength(3);
        expect(artistsResult._correctIdx).toBeGreaterThanOrEqual(0);
        expect(artistsResult._correctIdx).toBeLessThan(3);
      }
    });

    it('should handle errors gracefully', async () => {
      vi.spyOn(audiodb, 'getArtistNamesByGenre').mockReturnValue([]);

      render(<TestComponent onRender={(h) => { hookResult = h; }} />);

      // Wait for hook to be initialized
      await new Promise(resolve => setTimeout(resolve, 0));

      if (!hookResult) {
        throw new Error('Hook not initialized');
      }

      const artistsResult = await hookResult.getArtists('pop', 3);

      expect(artistsResult).toBeNull();
      expect(hookResult.error).toBeTruthy();
    });
  });

  describe('getSongs', () => {
    it('should return tracks with previews', async () => {
      const mockArtists = [
        { name: 'Artist1', id: '1', thumb: 'thumb1', genre: 'pop' },
      ];
      const mockAlbums = [
        { idAlbum: '1', strAlbum: 'Album1', strAlbumThumb: 'albumThumb1', idArtist: '1', strArtist: 'Artist1' },
      ];
      const mockTracks = [
        { idTrack: '1', strTrack: 'Track1', strArtist: 'Artist1', strAlbumThumb: 'thumb1' },
      ];
      const mockTracksWithPreviews = [
        { ...mockTracks[0], preview_url: 'http://preview.url' },
      ];

      vi.spyOn(audiodb, 'getAlbumsByArtist').mockResolvedValue(mockAlbums as any);
      vi.spyOn(audiodb, 'getTracksByAlbum').mockResolvedValue(mockTracks as any);
      vi.spyOn(deezer, 'getTrackPreviews').mockResolvedValue(mockTracksWithPreviews as any);

      render(<TestComponent onRender={(h) => { hookResult = h; }} />);

      // Wait for hook to be initialized
      await new Promise(resolve => setTimeout(resolve, 0));

      if (!hookResult) {
        throw new Error('Hook not initialized');
      }

      const tracks = await hookResult.getSongs(mockArtists, 0, 1);

      expect(tracks).toHaveLength(1);
      expect(tracks[0].preview_url).toBe('http://preview.url');
    });

    it('should return fallback track when no albums found', async () => {
      const mockArtists = [
        { name: 'Artist1', id: '1', thumb: 'thumb1', genre: 'pop' },
      ];

      vi.spyOn(audiodb, 'getAlbumsByArtist').mockResolvedValue([]);

      render(<TestComponent onRender={(h) => { hookResult = h; }} />);

      // Wait for hook to be initialized
      await new Promise(resolve => setTimeout(resolve, 0));

      if (!hookResult) {
        throw new Error('Hook not initialized');
      }

      const tracks = await hookResult.getSongs(mockArtists, 0, 1);

      expect(tracks).toHaveLength(1);
      expect(tracks[0].strTrack).toContain('Popular Track');
    });
  });
});


import { useEffect, useState } from 'react';
import type { Room } from '../../domain/models';
import { useContext } from '../context';
import { CreateRoomModal } from './create-room-modal';
import { JoinRoomModal } from './join-room-modal';
import { RoomCard } from './room-card';

export const RoomsWall = () => {
  const ctx = useContext();
  const rooms = ctx.useRooms();
  const isLoading = ctx.useIsLoading();
  const isCreateRoomOpen = ctx.useIsCreateRoomOpen();
  const isJoinRoomOpen = ctx.useIsJoinRoomOpen();
  const error = ctx.useError();

  // Local dismiss flags — the store has no explicit close trigger, so we layer on top
  const [createRoomDismissed, setCreateRoomDismissed] = useState(false);
  const [joinRoomDismissed, setJoinRoomDismissed] = useState(false);

  const showCreateRoom = isCreateRoomOpen && !createRoomDismissed;
  const showJoinRoom = isJoinRoomOpen && !joinRoomDismissed;

  useEffect(() => {
    ctx.init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenCreateRoom = () => {
    setCreateRoomDismissed(false);
    ctx.openCreateRoom();
  };

  const handleOpenJoinRoom = () => {
    setJoinRoomDismissed(false);
    ctx.openJoinRoom();
  };

  const handleJoinFromCard = (room: Room) => {
    if (room.hasPassword) {
      handleOpenJoinRoom();
    } else {
      ctx.submitJoinRoom({ roomId: room.id, roomCode: room.code });
    }
  };

  return (
    <>
      <div className="min-h-screen page-bg flex">
        {/* Left hero panel */}
        <div className="hidden lg:flex lg:w-72 xl:w-80 shrink-0 flex-col justify-center px-8 py-12 variant-hero">
          <p className="l1 text-[var(--color-primary-300)] mb-3">Amoria</p>
          <h1 className="t2 mb-3">
            Let&apos;s play{' '}
            <span className="bg-gradient-to-r from-[var(--color-primary-300)] to-[var(--color-secondary-300)] bg-clip-text text-transparent">
              together
            </span>
          </h1>
          <p className="b2 text-[var(--color-text-tertiary)] mb-10">
            Create a room or join an existing one to start your game night.
          </p>

          {/* Action cards */}
          <div className="flex flex-col gap-3">
            {/* Create room card */}
            <button
              type="button"
              onClick={handleOpenCreateRoom}
              className="variant-card group flex flex-col gap-2 p-4 text-left cursor-pointer hover:brightness-110 transition-all duration-150"
              disabled={isLoading}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[color-mix(in_srgb,var(--color-primary-500)_22%,transparent)] border border-[color-mix(in_srgb,var(--color-primary-300)_45%,transparent)] group-hover:scale-105 transition-transform duration-150">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--color-primary-300)]"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <p className="b2 font-semibold text-[var(--color-text-primary)]">Create new room</p>
              <p className="c1 text-[var(--color-text-tertiary)]">
                Create a new room and invite your partner to play
              </p>
              <span className="variant-button-primary self-start px-3 py-1.5 text-xs font-semibold font-sans mt-1">
                Create room
              </span>
            </button>

            {/* Join via code card */}
            <button
              type="button"
              onClick={handleOpenJoinRoom}
              className="variant-card group flex flex-col gap-2 p-4 text-left cursor-pointer hover:brightness-110 transition-all duration-150"
              disabled={isLoading}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[color-mix(in_srgb,var(--color-secondary-500)_22%,transparent)] border border-[color-mix(in_srgb,var(--color-secondary-300)_45%,transparent)] group-hover:scale-105 transition-transform duration-150">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--color-secondary-300)]"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </div>
              <p className="b2 font-semibold text-[var(--color-text-primary)]">Join room via code</p>
              <p className="c1 text-[var(--color-text-tertiary)]">
                Enter a 6-digit code to join your game night
              </p>
              <span className="variant-button-secondary self-start px-3 py-1.5 text-xs font-semibold font-sans mt-1">
                Join room
              </span>
            </button>
          </div>

          {/* How it works */}
          <div className="mt-8">
            <p className="l1 text-[var(--color-text-tertiary)] mb-3">How it works</p>
            <ol className="flex flex-col gap-2">
              {[
                'Create a new room or join existing one',
                'Share room code with your partner',
                'Start a game and play together',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-[color-mix(in_srgb,var(--color-primary-500)_25%,transparent)] border border-[color-mix(in_srgb,var(--color-primary-300)_50%,transparent)] text-[var(--color-primary-200)]">
                    {i + 1}
                  </span>
                  <span className="c1 text-[var(--color-text-tertiary)] pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right content panel */}
        <div className="flex-1 flex flex-col min-h-0 px-6 py-8 lg:px-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="t5 text-[var(--color-text-primary)]">Available rooms</h2>
              <p className="b3 text-[var(--color-text-tertiary)] mt-0.5">
                {isLoading
                  ? 'Loading rooms...'
                  : `${rooms.length} room${rooms.length !== 1 ? 's' : ''} available to join`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile create / join buttons */}
              <button
                type="button"
                onClick={handleOpenJoinRoom}
                className="lg:hidden variant-button-secondary px-3 py-2 text-xs font-semibold font-sans cursor-pointer"
                disabled={isLoading}
              >
                Join
              </button>
              <button
                type="button"
                onClick={handleOpenCreateRoom}
                className="lg:hidden variant-button-primary px-3 py-2 text-xs font-semibold font-sans cursor-pointer"
                disabled={isLoading}
              >
                + Create
              </button>

              {/* Filters row */}
              <div className="hidden sm:flex items-center gap-2">
                <button type="button" className="variant-pill cursor-pointer">All</button>
                <button type="button" className="variant-pill variant-pill-secondary cursor-pointer">Public</button>
                <button type="button" className="variant-pill variant-pill-secondary cursor-pointer">Private</button>
              </div>
            </div>
          </div>

          {/* Global error */}
          {error && (
            <div className="mb-4 rounded-xl px-4 py-3 bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)] border border-[color-mix(in_srgb,var(--color-error)_55%,transparent)]">
              <p className="b3 text-[var(--color-error)]">{error}</p>
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading && rooms.length === 0 && (
            <div className="flex flex-col gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="variant-card h-16 rounded-2xl animate-pulse bg-[color-mix(in_srgb,var(--color-surface-200)_60%,transparent)]"
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && rooms.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center bg-[color-mix(in_srgb,var(--color-primary-500)_15%,transparent)] border border-[color-mix(in_srgb,var(--color-primary-300)_30%,transparent)]">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--color-primary-300)]"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className="text-center">
                <p className="b1 font-semibold text-[var(--color-text-primary)]">No rooms yet</p>
                <p className="b3 text-[var(--color-text-tertiary)] mt-1">
                  Be the first to create a room and invite your partner!
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateRoom}
                className="variant-button-primary px-5 py-2.5 text-sm font-semibold font-sans cursor-pointer mt-2"
              >
                Create first room
              </button>
            </div>
          )}

          {/* Rooms list */}
          {rooms.length > 0 && (
            <div className="flex flex-col gap-2">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} onJoin={handleJoinFromCard} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateRoom && (
        <CreateRoomModal
          isLoading={isLoading}
          error={error}
          onSubmit={ctx.submitCreateRoom}
          onClose={() => setCreateRoomDismissed(true)}
        />
      )}

      {showJoinRoom && (
        <JoinRoomModal
          rooms={rooms}
          isLoading={isLoading}
          error={error}
          onSubmit={({ roomId, roomCode, roomPassword }) =>
            ctx.submitJoinRoom({
              roomId: roomId as Room['id'],
              roomCode,
              roomPassword,
            })
          }
          onClose={() => setJoinRoomDismissed(true)}
        />
      )}
    </>
  );
};

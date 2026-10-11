import React, { useState } from 'react';
import { Plus, Edit3, Check, Trash2, X, Shield, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { AVATAR_OPTIONS } from '../data/movies';

interface ProfileSelectorProps {
  profiles: UserProfile[];
  currentProfileId: string;
  onSelectProfile: (profile: UserProfile) => void;
  onAddProfile: (name: string, avatar: string, isKids: boolean) => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onDeleteProfile: (profileId: string) => void;
  onClose?: () => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  profiles,
  currentProfileId,
  onSelectProfile,
  onAddProfile,
  onUpdateProfile,
  onDeleteProfile,
  onClose,
}) => {
  const [isManaging, setIsManaging] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);

  // New Profile Form State
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState(AVATAR_OPTIONS[0]);
  const [newIsKids, setNewIsKids] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddProfile(newName.trim(), newAvatar, newIsKids);
    setNewName('');
    setNewAvatar(AVATAR_OPTIONS[0]);
    setNewIsKids(false);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile || !editingProfile.name.trim()) return;
    onUpdateProfile(editingProfile);
    setEditingProfile(null);
  };

  return (
    <div
      id="profile-selection-screen"
      className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center p-4 sm:p-8 animate-fadeIn select-none"
    >
      {/* Brand Watermark */}
      <div className="absolute top-8 left-8 sm:left-12 flex items-center space-x-2">
        <div className="flex items-center tracking-tighter">
          <span className="text-2xl sm:text-3xl font-black text-[#E50914]">
            FORT
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white">
            FLIX
          </span>
        </div>
      </div>

      {onClose && (
        <button
          id="profile-close-btn"
          onClick={onClose}
          className="absolute top-8 right-8 sm:right-12 p-2.5 rounded-md bg-white/5 hover:bg-white/15 border border-white/10 text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Main Content */}
      <div className="max-w-4xl w-full text-center space-y-8">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          {isManaging ? 'Gerenciar Perfis' : 'Quem está assistindo?'}
        </h1>

        {/* Profile Cards Grid */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-4">
          {profiles.map((profile) => {
            return (
              <div
                key={profile.id}
                id={`profile-card-${profile.id}`}
                className="flex flex-col items-center space-y-3 group cursor-pointer"
                onClick={() => {
                  if (isManaging) {
                    setEditingProfile(profile);
                  } else {
                    onSelectProfile(profile);
                  }
                }}
              >
                {/* Avatar Box */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-sm overflow-hidden border-2 border-transparent group-hover:border-white transition duration-200 transform-gpu group-hover:scale-105 shadow-xl bg-[#0d0d0d]">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Kids Badge */}
                  {profile.isKids && (
                    <div className="absolute bottom-1.5 right-1.5 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-xs shadow uppercase tracking-wider">
                      KIDS
                    </div>
                  )}

                  {/* Manage Overlay Pencil */}
                  {isManaging && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-xs">
                      <div className="p-2.5 rounded-md bg-black/80 border border-white/80 text-white">
                        <Edit3 className="w-5 h-5" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Name */}
                <span className="text-sm sm:text-base font-semibold text-gray-400 group-hover:text-white transition tracking-wide">
                  {profile.name}
                </span>
              </div>
            );
          })}

          {/* Add Profile Button */}
          {profiles.length < 6 && (
            <div
              id="profile-add-button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex flex-col items-center space-y-3 group cursor-pointer"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-sm border-2 border-dashed border-gray-700 group-hover:border-white flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-white/5 transition duration-200 transform-gpu group-hover:scale-105">
                <Plus className="w-10 h-10" />
              </div>
              <span className="text-sm sm:text-base font-semibold text-gray-400 group-hover:text-white transition tracking-wide">
                Adicionar Perfil
              </span>
            </div>
          )}
        </div>

        {/* Manage Profiles / Done Button */}
        <div className="pt-8">
          <button
            id="profile-manage-toggle-btn"
            onClick={() => setIsManaging(!isManaging)}
            className={`px-8 py-2.5 border text-xs sm:text-sm uppercase tracking-widest font-bold rounded-md transition cursor-pointer ${
              isManaging
                ? 'bg-white text-black border-white hover:bg-gray-200'
                : 'border-white/20 text-gray-300 hover:border-white hover:text-white hover:bg-white/5'
            }`}
          >
            {isManaging ? 'Concluído' : 'Gerenciar Perfis'}
          </button>
        </div>
      </div>

      {/* Add Profile Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d0d0d] max-w-md w-full rounded-sm border border-white/10 p-6 space-y-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold tracking-tight">Adicionar Perfil</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Nome do Perfil
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João, Maria, Gamer"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#141414] border border-white/20 rounded-md px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Escolha um Avatar
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {AVATAR_OPTIONS.map((avatar, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setNewAvatar(avatar)}
                      className={`relative aspect-square rounded-sm overflow-hidden border-2 cursor-pointer transition ${
                        newAvatar === avatar ? 'border-[#E50914] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={avatar} alt="Avatar option" className="w-full h-full object-cover" />
                      {newAvatar === avatar && (
                        <div className="absolute inset-0 bg-[#E50914]/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-[#141414] rounded-md border border-white/5">
                <input
                  type="checkbox"
                  id="add-kids-checkbox"
                  checked={newIsKids}
                  onChange={(e) => setNewIsKids(e.target.checked)}
                  className="w-4 h-4 rounded text-[#E50914] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="add-kids-checkbox" className="text-xs text-gray-200 cursor-pointer">
                  <span className="font-bold">Perfil Infantil?</span> (Exibe apenas animações e filmes com classificação Livre)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-bold rounded-md transition cursor-pointer shadow-lg"
                >
                  Salvar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d0d0d] max-w-md w-full rounded-sm border border-white/10 p-6 space-y-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold tracking-tight">Editar Perfil</h2>
              <button
                onClick={() => setEditingProfile(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Nome do Perfil
                </label>
                <input
                  type="text"
                  required
                  value={editingProfile.name}
                  onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                  className="w-full bg-[#141414] border border-white/20 rounded-md px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Trocar Avatar
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {AVATAR_OPTIONS.map((avatar, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setEditingProfile({ ...editingProfile, avatar })}
                      className={`relative aspect-square rounded-sm overflow-hidden border-2 cursor-pointer transition ${
                        editingProfile.avatar === avatar ? 'border-[#E50914] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={avatar} alt="Avatar option" className="w-full h-full object-cover" />
                      {editingProfile.avatar === avatar && (
                        <div className="absolute inset-0 bg-[#E50914]/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-[#141414] rounded-md border border-white/5">
                <input
                  type="checkbox"
                  id="edit-kids-checkbox"
                  checked={editingProfile.isKids}
                  onChange={(e) => setEditingProfile({ ...editingProfile, isKids: e.target.checked })}
                  className="w-4 h-4 rounded text-[#E50914] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="edit-kids-checkbox" className="text-xs text-gray-200 cursor-pointer">
                  <span className="font-bold">Perfil Infantil</span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                {profiles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Deseja realmente excluir o perfil "${editingProfile.name}"?`)) {
                        onDeleteProfile(editingProfile.id);
                        setEditingProfile(null);
                      }
                    }}
                    className="flex items-center space-x-1.5 text-xs text-rose-400 hover:text-rose-300 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir Perfil</span>
                  </button>
                )}

                <div className="flex items-center space-x-3 ml-auto">
                  <button
                    type="button"
                    onClick={() => setEditingProfile(null)}
                    className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-bold rounded-md transition cursor-pointer shadow-lg"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

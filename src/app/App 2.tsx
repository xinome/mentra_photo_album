"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { MagicLinkLogin } from "@/components/MagicLinkLogin";
import { MagicLinkSent } from "@/components/MagicLinkSent";
import { ProfileSetup } from "@/components/ProfileSetup";
import { Dashboard } from "@/components/Dashboard";
import { AlbumCreator } from "@/components/AlbumCreator";
import { AlbumViewer } from "@/components/AlbumViewer";
import { SharedAlbumViewer } from "@/components/SharedAlbumViewer";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  isNewUser?: boolean;
}

interface Album {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  photoCount: number;
  createdAt: string;
  category: "wedding" | "event" | "family" | "sports" | "other";
  isShared: boolean;
}

interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  title?: string;
  uploadedBy: {
    name: string;
    avatar?: string;
  };
  uploadedAt: string;
  likes: number;
  isLiked: boolean;
}

interface DetailedAlbum extends Album {
  photos: Photo[];
  contributors: Array<{
    name: string;
    avatar?: string;
  }>;
  owner: {
    name: string;
    avatar?: string;
  };
}

type AppState =
  | "login"
  | "magic-link-sent"
  | "profile-setup"
  | "dashboard"
  | "creating"
  | "viewing"
  | "shared-viewing";

export default function App() {
  const [currentState, setCurrentState] =
    useState<AppState>("login");
  const [currentUser, setCurrentUser] = useState<User | null>(
    null,
  );
  const [selectedAlbumId, setSelectedAlbumId] = useState<
    string | null
  >(null);
  const [magicLinkEmail, setMagicLinkEmail] =
    useState<string>("");

  // Mock data
  const mockAlbums: Album[] = [
    {
      id: "1",
      title: "田中家結婚式",
      description: "2024年春の素敵な結婚式の思い出",
      coverImage:
        "https://images.unsplash.com/photo-1587955793432-7c4ff80918ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90byUyMGFsYnVtJTIwbWVtb3JpZXMlMjBmYW1pbHl8ZW58MXx8fHwxNzU5NjQyOTkzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      photoCount: 127,
      createdAt: "2024-03-15",
      category: "wedding",
      isShared: true,
    },
    {
      id: "2",
      title: "サッカー部春合宿",
      description: "2024年春合宿の楽しい思い出",
      coverImage:
        "https://images.unsplash.com/photo-1758384075947-19c6bd7a1afb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNldmVudCUyMHBob3RvZ3JhcGh5JTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzU5NTk4NTgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
      photoCount: 89,
      createdAt: "2024-04-02",
      category: "sports",
      isShared: false,
    },
    {
      id: "3",
      title: "家族旅行 - 沖縄",
      description: "沖縄での楽しい家族旅行",
      coverImage:
        "https://images.unsplash.com/photo-1571763806648-5d022a3d1a29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHxtb2JpbGUlMjBjYW1lcmElMjB1cGxvYWR8ZW58MXx8fHwxNzU5NjQyOTk4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      photoCount: 45,
      createdAt: "2024-05-10",
      category: "family",
      isShared: true,
    },
  ];

  const mockDetailedAlbum: DetailedAlbum = {
    ...mockAlbums[0],
    photos: [
      {
        id: "p1",
        url: "https://images.unsplash.com/photo-1587955793432-7c4ff80918ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90byUyMGFsYnVtJTIwbWVtb3JpZXMlMjBmYW1pbHl8ZW58MXx8fHwxNzU5NjQyOTkzfDA&ixlib=rb-4.1.0&q=80&w=1080",
        thumbnail:
          "https://images.unsplash.com/photo-1587955793432-7c4ff80918ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90byUyMGFsYnVtJTIwbWVtb3JpZXMlMjBmYW1pbHl8ZW58MXx8fHwxNzU5NjQyOTkzfDA&ixlib=rb-4.1.0&q=80&w=300",
        uploadedBy: { name: "田中太郎" },
        uploadedAt: "2024-03-15",
        likes: 12,
        isLiked: false,
      },
      {
        id: "p2",
        url: "https://images.unsplash.com/photo-1758384075947-19c6bd7a1afb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNldmVudCUyMHBob3RvZ3JhcGh5JTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzU5NTk4NTgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
        thumbnail:
          "https://images.unsplash.com/photo-1758384075947-19c6bd7a1afb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNldmVudCUyMHBob3RvZ3JhcGh5JTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzU5NTk4NTgwfDA&ixlib=rb-4.1.0&q=80&w=300",
        uploadedBy: { name: "佐藤花子" },
        uploadedAt: "2024-03-15",
        likes: 8,
        isLiked: true,
      },
    ],
    contributors: [
      { name: "田中太郎" },
      { name: "佐藤花子" },
      { name: "山田一郎" },
    ],
    owner: {
      name: "田中太郎",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
  };

  const handleSendMagicLink = (email: string) => {
    // Mock magic link send
    setMagicLinkEmail(email);
    setCurrentState("magic-link-sent");
  };

  // Mock Magic Link success - simulate clicking link in email
  const handleMagicLinkSuccess = (
    isNewUser: boolean = true,
  ) => {
    if (isNewUser) {
      setCurrentState("profile-setup");
    } else {
      // Existing user - log them in directly
      setCurrentUser({
        id: "1",
        name: "田中太郎",
        email: magicLinkEmail,
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      });
      setCurrentState("dashboard");
    }
  };

  const handleProfileSetupComplete = (profileData: any) => {
    setCurrentUser({
      id: "1",
      name: profileData.displayName,
      email: magicLinkEmail,
      avatar: profileData.avatar,
      bio: profileData.bio,
      isNewUser: true,
    });
    setCurrentState("dashboard");
  };

  const handleSkipProfileSetup = () => {
    setCurrentUser({
      id: "1",
      name: "ユーザー",
      email: magicLinkEmail,
    });
    setCurrentState("dashboard");
  };

  const handleResendMagicLink = () => {
    // Mock resend logic
    console.log("Resending magic link to:", magicLinkEmail);
  };

  const handleBackToLogin = () => {
    setCurrentState("login");
    setMagicLinkEmail("");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentState("login");
  };

  const handleCreateAlbum = () => {
    setCurrentState("creating");
  };

  const handleOpenAlbum = (albumId: string) => {
    setSelectedAlbumId(albumId);
    setCurrentState("viewing");
  };

  const handleBackToDashboard = () => {
    setCurrentState("dashboard");
    setSelectedAlbumId(null);
  };

  const handleSaveAlbum = (albumData: any) => {
    // Mock save album
    console.log("Saving album:", albumData);
    setCurrentState("dashboard");
  };

  const handleShareAlbum = () => {
    // Mock share
    alert(
      "アルバムの共有リンクがクリップボードにコピーされました！",
    );
  };

  const handleDownloadAlbum = () => {
    // Mock download
    alert("アルバムのダウンロードを開始します...");
  };

  const handleLikePhoto = (photoId: string) => {
    // Mock like photo
    console.log("Liked photo:", photoId);
  };

  return (
    <div className="min-h-screen bg-background">
      {currentUser && (
        <Header user={currentUser} onLogout={handleLogout} />
      )}

      {currentState === "login" && (
        <MagicLinkLogin onSendMagicLink={handleSendMagicLink} />
      )}

      {currentState === "magic-link-sent" && (
        <MagicLinkSent
          email={magicLinkEmail}
          onBack={handleBackToLogin}
          onResend={handleResendMagicLink}
          onMockLogin={handleMagicLinkSuccess}
        />
      )}

      {currentState === "profile-setup" && (
        <ProfileSetup
          email={magicLinkEmail}
          onComplete={handleProfileSetupComplete}
          onSkip={handleSkipProfileSetup}
        />
      )}

      {currentState === "dashboard" && (
        <Dashboard
          albums={mockAlbums}
          onCreateAlbum={handleCreateAlbum}
          onOpenAlbum={handleOpenAlbum}
        />
      )}

      {currentState === "creating" && (
        <AlbumCreator
          onBack={handleBackToDashboard}
          onSave={handleSaveAlbum}
        />
      )}

      {currentState === "viewing" && selectedAlbumId && (
        <AlbumViewer
          album={mockDetailedAlbum}
          onBack={handleBackToDashboard}
          onShare={handleShareAlbum}
          onDownload={handleDownloadAlbum}
          onLikePhoto={handleLikePhoto}
        />
      )}

      {currentState === "shared-viewing" && selectedAlbumId && (
        <SharedAlbumViewer
          album={mockDetailedAlbum}
          onDownload={handleDownloadAlbum}
          onShare={handleShareAlbum}
        />
      )}
    </div>
  );
}
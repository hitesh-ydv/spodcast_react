import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Loader from "../../components/Loader";

const API_URL = import.meta.env.VITE_API_URL2; // renamed from URL

const UserProfile = () => {
  const { userid } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [tempImage, setTempImage] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const prevObjectUrlRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const res = await axios.get(`${API_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userid && res.data.userId !== userid) {
          // you used setError earlier but error state wasn't defined — keep simple:
          console.error("You are not allowed to view this profile.");
          setUser(null);
        } else {
          setUser(res.data);
          setEditedName(res.data.name || "");

          // set profileImage to the photo endpoint so the avatar displays
          if (res.data.userId) {
            setProfileImage(`${API_URL}/api/user/${res.data.userId}/photo`);
            setTempImage(`${API_URL}/api/user/${res.data.userId}/photo`);
          }
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // cleanup when component unmounts: revoke any created object URL
    return () => {
      if (prevObjectUrlRef.current) {
        try {
          window.URL.revokeObjectURL(prevObjectUrlRef.current);
        } catch (e) {}
        prevObjectUrlRef.current = null;
      }
    };
  }, [userid]);

  const handleEditProfile = () => {
    setShowEditPopup(true);
    setTempImage(profileImage);
  };

  const handleClosePopup = () => {
    setShowEditPopup(false);

    // revoke any preview object URL we created when canceling (but keep profileImage)
    if (prevObjectUrlRef.current) {
      try {
        window.URL.revokeObjectURL(prevObjectUrlRef.current);
      } catch (e) {}
      prevObjectUrlRef.current = null;
    }

    setTempImage(profileImage);
    setSelectedFile(null);
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      // Update name
      await axios.put(
        `${API_URL}/api/user/update`,
        { name: editedName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // If there's a new image, upload it
      if (selectedFile) {
        const formData = new FormData();
        formData.append("photo", selectedFile);

        await axios.put(`${API_URL}/api/user/update-photo`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        // Set profile image to server endpoint (the server should now serve the updated photo)
        if (user && user.userId) {
          const newPhotoUrl = `${API_URL}/api/user/${user.userId}/photo?ts=${Date.now()}`;
          setProfileImage(newPhotoUrl);
          setTempImage(newPhotoUrl);
        }
      }

      setUser((prev) => ({ ...prev, name: editedName }));
      setShowEditPopup(false);

      // optional: refresh to ensure every component reads new photo; you can remove
      window.location.reload();
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image should be less than 5MB");
      return;
    }

    // revoke previous object URL if we created one
    if (prevObjectUrlRef.current) {
      try {
        window.URL.revokeObjectURL(prevObjectUrlRef.current);
      } catch (e) {}
      prevObjectUrlRef.current = null;
    }

    // Use the global URL to create a preview
    const preview = window.URL.createObjectURL(file);
    prevObjectUrlRef.current = preview;
    setTempImage(preview);

    setSelectedFile(file);
  };

  if (loading) return <Loader />;

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-lg">
        User not found.
      </div>
    );
  }

  return (
    <div className="h-full bg-[#121212] text-white">
      <div className="flex flex-col items-center justify-center pt-16 pb-8 px-6">
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full bg-green-600 flex items-center justify-center text-4xl font-bold shadow-lg overflow-hidden">
            {user.userId ? (
              <img
                src={profileImage || `${API_URL}/api/user/${user.userId}/photo`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : user.name ? (
              user.name.charAt(0).toUpperCase()
            ) : (
              "?"
            )}
          </div>
        </div>

        <div className="text-center space-y-3 mb-6">
          <h1 className="text-3xl font-semibold">{user.name}</h1>
          <div className="flex justify-center gap-6 text-gray-400">
            <div className="text-center">
              <p className="font-semibold text-white">1</p>
              <p className="text-sm">Public Playlist</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-white">3</p>
              <p className="text-sm">Following</p>
            </div>
          </div>
        </div>

        <button
          className="bg-green-600 px-6 py-2 rounded-full font-semibold hover:bg-green-500 transition mb-8"
          onClick={handleEditProfile}
        >
          Edit Profile
        </button>
      </div>

      {showEditPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
          <div className="bg-[#282828] rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6">Profile details</h2>

            <div className="flex flex-col items-center mb-6">
              <div
                className="w-32 h-32 rounded-full bg-green-600 flex items-center justify-center text-4xl font-bold mb-4 overflow-hidden cursor-pointer"
                onClick={handleImageClick}
              >
                {tempImage ? (
                  <img
                    src={tempImage}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : user.userId ? (
                  <img
                    src={`${API_URL}/api/user/${user.userId}/photo`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                  </span>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              <button
                onClick={handleImageClick}
                className="text-green-500 font-semibold hover:text-green-400"
              >
                Change photo
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full bg-[#3e3e3e] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="bg-[#1a1a1a] p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-400">
                By proceeding, you agree to give Spodcast access to the image you
                choose to upload. Please make sure you have the right to upload
                the image.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClosePopup}
                className="flex-1 bg-transparent border border-gray-600 text-white px-4 py-3 rounded-full font-medium hover:border-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-full font-medium hover:bg-green-500 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;

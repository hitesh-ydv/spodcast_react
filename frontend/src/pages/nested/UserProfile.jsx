import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Loader from "../../components/Loader";

const URL = import.meta.env.VITE_API_URL2;

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


    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    // redirect to login if not logged in
                    window.location.href = "/login";
                    return;
                }

                const res = await axios.get(`${URL}/api/user/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Optional: check if URL param matches logged-in userId
                if (userid && res.data.userId !== userid) {
                    setError("You are not allowed to view this profile.");
                    setUser(null);
                } else {
                    setUser(res.data);
                    setEditedName(res.data.name);
                }
            } catch (err) {
                console.error("Error fetching user:", err);
                setError("Failed to fetch user data.");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userid]);


    const handleEditProfile = () => {
        setShowEditPopup(true);
        setTempImage(profileImage);
    };

    const handleClosePopup = () => {
        setShowEditPopup(false);
        setTempImage(profileImage);
    };

    const handleSaveProfile = async () => {
        try {
            const token = localStorage.getItem("token");

            // Update name
            const res = await axios.put(
                `${URL}/api/user/update`,
                { name: editedName },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // If there's a new image, upload it
            if (tempImage && tempImage !== profileImage) {
                const formData = new FormData();
                formData.append('photo', selectedFile);

                await axios.put(
                    `${URL}/api/user/update-photo`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );

                setProfileImage(tempImage);
            }

            setUser({ ...user, name: editedName });
            setShowEditPopup(false);
            window.location.reload();

        } catch (err) {
            console.error("Error updating profile:", err);
            alert("Failed to update profile");
        }
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file");
            return;
        }

        // Validate size (optional)
        if (file.size > 5 * 1024 * 1024) {
            alert("Image should be less than 5MB");
            return;
        }

        // Set temp image as a preview URL
        setTempImage(URL.createObjectURL(file));

        // Optionally store the File object for uploading
        setSelectedFile(file);
    };


    if (loading) {
        return (
            <Loader />
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen text-white text-lg">
                User not found.
            </div>
        );
    }

    return (
        <div className="h-full bg-[#121212] text-white">
            {/* Main Profile Content */}
            <div className="flex flex-col items-center justify-center pt-16 pb-8 px-6">
                {/* Avatar */}
                <div className="relative mb-6">
                    <div className="w-28 h-28 rounded-full bg-green-600 flex items-center justify-center text-4xl font-bold shadow-lg overflow-hidden">
                        {user.userId ? (
                            <img
                                src={`${URL}/api/user/${user.userId}/photo`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            user.name ? user.name.charAt(0).toUpperCase() : "?"
                        )}
                    </div>
                </div>

                {/* User Info */}
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

                {/* Edit Profile Button */}
                <button
                    className="bg-green-600 px-6 py-2 rounded-full font-semibold hover:bg-green-500 transition mb-8"
                    onClick={handleEditProfile}
                >
                    Edit Profile
                </button>

                {/* Library Section */}
                <div className="w-full max-w-2xl">
                    <h2 className="text-2xl font-bold mb-6">Your Library</h2>

                    {/* Playlists Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4 text-gray-400">Playlists</h3>
                        <div className="space-y-4">
                            {/* Sample Playlist Items */}
                            <div className="flex items-center gap-4 p-3 hover:bg-[#1a1a1a] rounded-lg cursor-pointer">
                                <div className="w-12 h-12 bg-purple-600 rounded"></div>
                                <div>
                                    <p className="font-semibold">My Playlist #2</p>
                                    <p className="text-sm text-gray-400">Playlist • {user.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-3 hover:bg-[#1a1a1a] rounded-lg cursor-pointer">
                                <div className="w-12 h-12 bg-blue-600 rounded"></div>
                                <div>
                                    <p className="font-semibold">Shree Ram songs</p>
                                    <p className="text-sm text-gray-400">Playlist • Seamed Asia</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Artists Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-400">Artists</h3>
                        <div className="space-y-4">
                            {/* Sample Artist Items */}
                            <div className="flex items-center gap-4 p-3 hover:bg-[#1a1a1a] rounded-lg cursor-pointer">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-red-500"></div>
                                <div>
                                    <p className="font-semibold">Karan Aujla</p>
                                    <p className="text-sm text-gray-400">Artist</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-3 hover:bg-[#1a1a1a] rounded-lg cursor-pointer">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500"></div>
                                <div>
                                    <p className="font-semibold">Navaan Sandhu</p>
                                    <p className="text-sm text-gray-400">Artist</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Popup */}
            {showEditPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
                    <div className="bg-[#282828] rounded-xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold mb-6">Profile details</h2>

                        {/* Profile Image Upload */}
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
                                        src={`${URL}/api/user/${user.userId}/photo`}
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
                                accept=""
                                onChange={handleImageChange}
                            />
                            <button
                                onClick={handleImageClick}
                                className="text-green-500 font-semibold hover:text-green-400"
                            >
                                Change photo
                            </button>
                        </div>

                        {/* Name Edit Field */}
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

                        {/* Privacy Notice */}
                        <div className="bg-[#1a1a1a] p-4 rounded-lg mb-6">
                            <p className="text-sm text-gray-400">
                                By proceeding, you agree to give Spodcast access to the image you choose to upload.
                                Please make sure you have the right to upload the image.
                            </p>
                        </div>

                        {/* Action Buttons */}
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
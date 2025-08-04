import React from "react";

const Profile = () => {
  return (
    <div className="page profile-page">
      <h1>Profile</h1>
      <div className="profile-info">
        <img
          src="https://via.placeholder.com/150"
          alt="Profile"
          className="profile-image"
        />
        <h2>Prashant</h2>
        <p>Web Developer</p>
      </div>
    </div>
  );
};

export default Profile;

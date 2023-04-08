import { useState } from "react";
import "./App.css";
import axios from "axios";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  Timestamp,
  arrayRemove,
} from "firebase/firestore";
import { useEffect } from "react";
// const cloudinary = require("cloudinary").v2; // import cloudinary SDK

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcQs1sYlTUJdnrVawYFlk6FPDWZX5ndTk",
  authDomain: "parkermile-e1d21.firebaseapp.com",
  projectId: "parkermile-e1d21",
  storageBucket: "parkermile-e1d21.appspot.com",
  messagingSenderId: "802538834506",
  appId: "1:802538834506:web:236ac1834adc7c3554f4b3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const timestamp = Timestamp.fromDate(new Date());

function App() {
  const [profile, setProfile] = useState();
  const [wallpaper, setWallpaper] = useState([]);
  const [getProfile, setGetProfile] = useState({
    imageUrl: "",
    publicId: "",
  });
  const [getWallpaper, setGetWallpaper] = useState({ Logs: [] });
  useEffect(() => {
    getLinks();
    const profileRef = doc(db, "profile", "6j4PS2VQxI6MW7HABAL4");
    const unsubscribe = onSnapshot(profileRef, (doc) => {
      if (doc.exists()) {
        setGetProfile(doc.data());
      } else {
        console.log("No such document!");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  function extractId(str) {
    // Use a regular expression to match and remove the prefix "blogs_post/"
    const id = str.replace(/^parkmile_mobile\//, "");
    return id;
  }

  async function upload(payload, profile) {
    const data = new FormData();
    data.append("file", payload);
    data.append("upload_preset", "parkmile");
    await axios
      .post(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUD_NAME}/image/upload`,
        data
      )
      .then(async (res) => {
        if (profile) {
          const profileRef = doc(db, "profile", "6j4PS2VQxI6MW7HABAL4");
          await setDoc(profileRef, {
            imageUrl: res.data.secure_url,
            publicId: res.data.public_id,
          });
        } else {
          const WallpaperRef = doc(db, "wallpaper", "VhiE64zwvuFGvC0YhvCC");
          await updateDoc(WallpaperRef, {
            Logs: arrayUnion({
              imageUrl: res.data.secure_url,
              publicId: res.data.public_id,
              timestamp,
            }),
          });
        }
      })
      .then((res) => {
        if (profile) {
          alert("profile picture succesfully updated");
        } else {
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function getLinks() {
    //
    const docRef = doc(db, "wallpaper", "VhiE64zwvuFGvC0YhvCC");
    const wallpaperSnap = await getDoc(docRef);
    if (wallpaperSnap.exists()) {
      setGetWallpaper(wallpaperSnap.data());
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  }

  function handleSubmitWallpaper(e) {
    e.preventDefault();
    if (wallpaper.length < 0) {
      return;
    }
    for (let i = 0; i <= wallpaper.length; i++) {
      upload(wallpaper[i], false);
    }
  }
  function handleSubmitProfile(e) {
    e.preventDefault();
    if (!profile) {
      return;
    }
    // deleteImage(extractId(getProfile.publicId));
    upload(profile, true);
  }

  const deleteImage = async (publicId) => {
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUD_NAME}/image/destroy`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            public_id: publicId,
            api_key: process.env.REACT_APP_API_KEY,
            api_secret: process.env.REACT_APP_API_SECRET,
          }),
        }
      );

      if (response.ok) {
        console.log(`Image ${publicId} deleted successfully`);
      } else {
        console.log(`Error deleting image ${publicId}: ${response.statusText}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  async function handleDelete(e) {
    let target = e.currentTarget.parentElement;
    let id = target.getAttribute("data-index");
    let choose = getWallpaper.Logs[id];
    const WallpaperRef = doc(db, "wallpaper", "VhiE64zwvuFGvC0YhvCC");
    await updateDoc(WallpaperRef, {
      Logs: arrayRemove(choose),
    });
    alert("done");
  }

  return (
    <div className="App">
      <div className="profilePic">
        <h2>Profile Pic</h2>
        <img src={getProfile.imageUrl} alt="profile" width={300} />
      </div>
      <div className="wallpaper">
        <h2>Wallpapers</h2>
        <div className="content">
          {getWallpaper.Logs.map((item, i) => {
            return (
              <div className="items" data-index={i} key={i}>
                <img src={item.imageUrl} alt="wallpaper" width={200} />
                <button type="submit" className="btn" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <form onSubmit={handleSubmitProfile}>
        <h1>Update Your Profile picture</h1>
        <label htmlFor="profile">
          Profile picture:
          <input
            type="file"
            accept="image*"
            onChange={(e) => {
              setProfile((prev) => (prev = e.target.files[0]));
            }}
            name="profile"
            id="profile"
          />
        </label>
        <br />
        <label htmlFor="submit">
          <input type="submit" value="Submit" />
        </label>
      </form>
      <form onSubmit={handleSubmitWallpaper} action="">
        <h1>Update Your Wallpaper</h1>
        <label htmlFor="wallpaper">
          wallpaper:
          <input
            type="file"
            name="wallpaper"
            id="wallpaper"
            onChange={(e) => {
              setWallpaper((prev) => (prev = e.target.files));
            }}
            multiple
            accept="image*"
          />
        </label>
        <label htmlFor="submit">
          <input type="submit" value="Submit" />
        </label>
      </form>
    </div>
  );
}

export default App;

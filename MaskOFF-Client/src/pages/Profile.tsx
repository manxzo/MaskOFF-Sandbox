import { useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { GlobalConfigContext } from "@/config/GlobalConfig"; // import interfaces
import DefaultLayout from "@/layouts/default";
import { Card, CardBody, Spinner } from "@heroui/react";
import { title, subtitle } from "@/components/primitives";
import axios from "axios";

const Profile = () => {
  const { username } = useParams<{ username: string | null }>();
  const { user } = useContext(GlobalConfigContext)!;
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // fetch profile data using username or current user
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (username) {
          // use endpoint to get public profile by username
          const res = await axios.get(`/api/user/by-username/${username}`);
          setProfileData(res.data);
          console.log(res.data);
        } else if (user) {
          // use full details from context
          setProfileData(user.profile);
        }
      } catch (err) {
        console.error("error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username, user]);

  return (
    <DefaultLayout>
      <div className="p-8">
        {loading ? (
          <Spinner size="lg" />
        ) : profileData ? (
          <Card>
            <CardBody>
              <h1 className={title({ size: "lg", color: "cyan", fullWidth: true })}>
                {profileData.name} (@{profileData.username})
              </h1>
              <p className={subtitle({ fullWidth: true })}>
                bio: {profileData.profile?.publicInfo?.bio || "no bio provided."}
              </p>
              {profileData.profile?.publicInfo?.skills && (
                <p>skills: {profileData.profile.publicInfo.skills.join(", ")}</p>
              )}
              {profileData.profile?.publicInfo?.achievements && (
                <p>achievements: {profileData.profile.publicInfo.achievements.join(", ")}</p>
              )}
              {profileData.profile?.publicInfo?.portfolio && (
                <p>portfolio: {profileData.profile.publicInfo.portfolio}</p>
              )}
            </CardBody>
          </Card>
        ) : (
          <p>profile not found.</p>
        )}
      </div>
    </DefaultLayout>
  );
};

export default Profile;

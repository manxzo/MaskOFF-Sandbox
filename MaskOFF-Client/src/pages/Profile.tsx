import { useParams, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { GlobalConfigContext } from "@/config/GlobalConfig";
import DefaultLayout from "@/layouts/default";
import { Card, CardBody, Spinner } from "@heroui/react";
import { title, subtitle } from "@/components/primitives";
import axios from "axios";

const Profile = () => {
  const { username } = useParams<{ username: string | null }>();
  const navigate = useNavigate();
  const { user } = useContext(GlobalConfigContext)!;
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // If no username is provided in the URL, redirect to the current user's profile URL.
  useEffect(() => {
    if (!username && user && user.username) {
      navigate(`/profile/${user.username}`, { replace: true });
    }
  }, [username, user, navigate]);

  // Fetch profile data using the username param (or fallback to context)
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (username) {
          const res = await axios.get(`/api/user/by-username/${username}`);
          setProfileData(res.data);
        } else if (user) {
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
                Bio: {profileData.profile?.publicInfo?.bio || "no bio provided."}
              </p>
              {profileData.profile?.publicInfo?.skills && (
                <p>Skills: {profileData.profile.publicInfo.skills.join(", ")}</p>
              )}
              {profileData.profile?.publicInfo?.achievements && (
                <p>Achievements: {profileData.profile.publicInfo.achievements.join(", ")}</p>
              )}
              {profileData.profile?.publicInfo?.portfolio && (
                <p>Portfolio: {profileData.profile.publicInfo.portfolio}</p>
              )}
            </CardBody>
          </Card>
        ) : (
          <p>Profile not found.</p>
        )}
      </div>
    </DefaultLayout>
  );
};

export default Profile;

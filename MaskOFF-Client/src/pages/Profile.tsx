import { useParams, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { GlobalConfigContext } from "@/config/GlobalConfig";
import DefaultLayout from "@/layouts/default";
import { Card, CardBody, Spinner } from "@heroui/react";
import { title, subtitle } from "@/components/primitives";
import axios from "axios";

interface PublicProfileResponse {
  user: {
    name: string;
    username: string;
    // add other fields if needed
  };
  profile: {
    publicInfo: {
      bio: string;
      skills: string[];
      achievements: string[];
      portfolio: string;
    };
  };
}

const Profile = () => {
  const { username } = useParams<{ username: string | null }>();
  const navigate = useNavigate();
  const { user } = useContext(GlobalConfigContext)!;

  const [profileData, setProfileData] = useState<PublicProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);


          // Fetch public profile by username
          const res = await axios.get<PublicProfileResponse>(`http://localhost:3000/api/user/by-username/${username}`);
          console.log("API response:", res.data);
          setProfileData(res.data);
        } else if (user && user.profile) {
          // Use current user's profile details from context if no username parameter is provided
          setProfileData({
            user: {
              name: user.name,
              username: user.username,
            },
            profile: {
              publicInfo: {
                bio: user.profile.publicInfo.bio,
                skills: user.profile.publicInfo.skills,
                achievements: user.profile.publicInfo.achievements,
                portfolio: user.profile.publicInfo.portfolio,
              },
            },
          });

      
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
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
                {profileData.user.name} (@{profileData.user.username})
              </h1>
              <p className={subtitle({ fullWidth: true })}>
                Bio: {profileData.profile.publicInfo.bio || "No bio provided."}
              </p>
              {profileData.profile.publicInfo.skills && (
                <p>Skills: {profileData.profile.publicInfo.skills.join(", ")}</p>
              )}
              {profileData.profile.publicInfo.achievements && (
                <p>Achievements: {profileData.profile.publicInfo.achievements.join(", ")}</p>
              )}
              {profileData.profile.publicInfo.portfolio && (
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

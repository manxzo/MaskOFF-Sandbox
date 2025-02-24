import { useState, useContext, useEffect } from "react";
import { GlobalConfigContext } from "@/config/GlobalConfig";
import DefaultLayout from "@/layouts/default";
import { Card, CardBody, CardHeader, Button, Input, Textarea, addToast } from "@heroui/react";
import { title } from "@/components/primitives";
import { updateProfile } from "@/services/services";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { user, setUser } = useContext(GlobalConfigContext)!;
  const navigate = useNavigate();
  const [bio, setBio] = useState(user?.profile?.publicInfo?.bio || "");
  const [skills, setSkills] = useState(
    user?.profile?.publicInfo?.skills?.join(", ") || ""
  );
  const [achievements, setAchievements] = useState(
    user?.profile?.publicInfo?.achievements?.join(", ") || ""
  );
  const [portfolio, setPortfolio] = useState(
    user?.profile?.publicInfo?.portfolio || ""
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.profile) {
      setBio(user.profile.publicInfo.bio || "");
      setSkills(user.profile.publicInfo.skills?.join(", ") || "");
      setAchievements(user.profile.publicInfo.achievements?.join(", ") || "");
      setPortfolio(user.profile.publicInfo.portfolio || "");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfile(user?.userID, {
        publicInfo: {
          bio,
          skills: skills.split(",").map((s) => s.trim()),
          achievements: achievements.split(",").map((s) => s.trim()),
          portfolio,
        },
      });
      setUser({ ...user, profile: res.data.profile });
      addToast({ title: "settings updated", color: "success" });
      navigate("/profile");
    } catch (err: any) {
      console.error("error updating settings:", err);
      addToast({ title: err.message || "update failed", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="p-8 max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <h2 className={title({ size: "lg", color: "green", fullWidth: true })}>
              Profile Settings
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <Textarea
                label="Bio"
                placeholder="enter your bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <Input
                label="Skills"
                placeholder="comma-separated list of skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
              <Input
                label="Achievements"
                placeholder="comma-separated list of achievements"
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
              />
              <Input
                label="Portfolio"
                placeholder="enter portfolio link or details"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
              />
              <Button type="submit" color="primary" isLoading={loading}>
                Save Settings
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default Settings;

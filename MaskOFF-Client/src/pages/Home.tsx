// src/pages/Home.tsx
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { subtitle, title } from "@/components/primitives";
const Home = () => {
  return (
    <DefaultLayout>
      <div className="p-8 text-center">
        <pre className={title({ color: "violet", size: "lg", fullWidth: true })}>Welcome to MASKoff</pre>
        <pre  className={`mt-4 ${subtitle({fullWidth:true})}`}>
          A platform for community, jobs, and direct messaging.
        </pre>
        <div className="mt-6 space-x-4">
          <Button variant="solid"  onPress={() =>
            addToast({
              title: "Toast title",
              description: "Toast displayed successfully",
              color: "success",
            })
          }>
            Login
          </Button>
          <Button variant="shadow">
            Create User
          </Button>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Home;

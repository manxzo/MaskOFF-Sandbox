import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { Spinner } from "@heroui/react";
import useJobs from "@/hooks/useJobs";
import DefaultLayout from "@/layouts/default";
import JobInput from "@/components/JobInput";
import JobList from "@/components/JobList";
import { addToast } from "@heroui/toast";

interface Job {
  jobID: string;
  title: string;
  description: string;
  price: number;
  contractPeriod: string;
  isComplete: boolean;
  user: {
    userID: string;
    username: string;
    publicInfo: {
      bio: string;
    };
  };
}

interface JobFormData {
  title: string;
  description: string;
  price: number;
  contractPeriod: string;
}

const Jobs = () => {
  const {
    jobs,
    loading,
    error,
    fetchJobs,
    createNewJob,
    updateExistingJob,
    deleteExistingJob,
  } = useJobs();

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [currentUserID, setCurrentUserID] = useState<string>("");

  useEffect(() => {
    const loadJobs = async () => {
      try {
        await fetchJobs();
      } catch (err) {
        addToast({
          title: "Error",
          description: "Failed to load jobs. Please try again later.",
          color: "danger",
          size: "lg",
        });
      }
    };

    loadJobs();
    
    // Get user ID from localStorage
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserID(payload.id || "");
      } catch (err) {
        console.error("Error parsing token:", err);
        setCurrentUserID("");
      }
    }
  }, []);

  const handleCreate = async (data: JobFormData) => {
    try {
      await createNewJob(data);
      addToast({
        title: "Success",
        description: "Job created successfully",
        color: "success",
        size: "lg",
      });
    } catch (err: any) {
      addToast({
        title: "Error",
        description: err.message || "Failed to create job",
        color: "danger",
        size: "lg",
      });
    }
  };

  const handleUpdate = async (data: JobFormData) => {
    try {
      if (selectedJob) {
        await updateExistingJob(selectedJob.jobID, data);
        setSelectedJob(null);
        addToast({
          title: "Success",
          description: "Job updated successfully",
          color: "success",
          size: "lg",
        });
      }
    } catch (err: any) {
      addToast({
        title: "Error",
        description: err.message || "Failed to update job",
        color: "danger",
        size: "lg",
      });
    }
  };

  const handleDelete = async (jobID: string) => {
    try {
      await deleteExistingJob(jobID);
      addToast({
        title: "Success",
        description: "Job deleted successfully",
        color: "success",
        size: "lg",
      });
    } catch (err: any) {
      addToast({
        title: "Error",
        description: err.message || "Failed to delete job",
        color: "danger",
        size: "lg",
      });
    }
  };

  const handleApply = async (jobID: string) => {
    try {
      // Need to implement this in services and API
      // await applyToJob(jobID);
      addToast({
        title: "Success",
        description: "Application submitted successfully",
        color: "success",
        size: "lg",
      });
    } catch (err: any) {
      addToast({
        title: "Error",
        description: err.message || "Failed to apply for job",
        color: "danger",
        size: "lg",
      });
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Spinner size="lg" />
        </div>
      </DefaultLayout>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <DefaultLayout>
      <div>
        <div>
          <h1>Jobs Board</h1>
        </div>

        {selectedJob ? (
          <>
            <h2>Edit Job</h2>
            <JobInput
              onSubmit={handleUpdate}
              initialData={{
                title: selectedJob.title,
                description: selectedJob.description,
                price: selectedJob.price,
                contractPeriod: selectedJob.contractPeriod,
              }}
              submitLabel="Update Job"
            />
            <Button variant="flat" onPress={() => setSelectedJob(null)}>
              Cancel Edit
            </Button>
          </>
        ) : (
          <>
            <h2>Create New Job</h2>
            <JobInput onSubmit={handleCreate} />
          </>
        )}

        <JobList
          jobs={jobs || []}
          currentUserID={currentUserID}
          onEdit={setSelectedJob}
          onDelete={handleDelete}
          onApply={handleApply}
        />
      </div>
    </DefaultLayout>
  );
};

export default Jobs; 
import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { Card } from "@heroui/react";
import useJobs from "@/hooks/useJobs";
import DefaultLayout from "@/layouts/default";
import JobInput from "@/components/JobInput";

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

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreate = async (data: JobFormData) => {
    try {
      await createNewJob(data);
      alert("Job created successfully");
    } catch (err: any) {
      alert(err.message || "Failed to create job");
    }
  };

  const handleUpdate = async (data: JobFormData) => {
    try {
      if (selectedJob) {
        await updateExistingJob(selectedJob.jobID, data);
        setSelectedJob(null);
        alert("Job updated successfully");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update job");
    }
  };

  const handleDelete = async (jobID: string) => {
    try {
      await deleteExistingJob(jobID);
      alert("Job deleted successfully");
    } catch (err: any) {
      alert(err.message || "Failed to delete job");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
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
            <Button variant="flat" onClick={() => setSelectedJob(null)}>
              Cancel Edit
            </Button>
          </>
        ) : (
          <>
            <h2>Create New Job</h2>
            <JobInput onSubmit={handleCreate} />
          </>
        )}

        <div>
          {jobs?.map((job) => (
            <Card key={job.jobID}>
              <div>
                <h2>Job Title: {job.title}</h2>
                <div>
                  Posted by: {job.user.username}
                  <br />
                  Contract Period: {job.contractPeriod}
                </div>
              </div>
              <div>
                <p>Job Description: {job.description}</p>
                <p>Job Price: ${job.price}</p>
              </div>
              <div>
                <Button variant="flat" onClick={() => setSelectedJob(job)}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(job.jobID)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Jobs; 
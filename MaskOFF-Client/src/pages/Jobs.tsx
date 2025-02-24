//@ts-nocheck
import React, { useEffect, useState, useContext } from "react";
import DefaultLayout from "@/layouts/default";
import useJobs from "@/hooks/useJobs";
import useChats from "@/hooks/useChats";
import JobInput from "@/components/JobInput";
import JobList from "@/components/JobList";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Textarea, Button } from "@heroui/react";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";
import { GlobalConfigContext } from "@/config/GlobalConfig";

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
  const { user } = useContext(GlobalConfigContext);
  const {
    jobs,
    loading: jobsLoading,
    error: jobsError,
    fetchJobs,
    createNewJob,
    updateExistingJob,
    deleteExistingJob,
  } = useJobs();
  const { sendChatMessage } = useChats();

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");

  useEffect(() => {
    (async () => {
      await fetchJobs();
    })();
  }, []);

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setApplyModalOpen(true);
  };

  const handleSubmitApplication = async () => {
    if (!selectedJob) return;
    if (!applicationMessage.trim()) {
      addToast({
        title: "Error",
        description: "Please enter your application message.",
        color: "danger",
        size: "lg",
      });
      return;
    }
    try {
      await sendChatMessage({
        recipientID: selectedJob.user.userID,
        text: applicationMessage.trim(),
        chatType: "job",
      });
      addToast({
        title: "Success",
        description: "Application submitted successfully",
        color: "success",
        size: "lg",
      });
      setApplyModalOpen(false);
      setApplicationMessage("");
      setSelectedJob(null);
    } catch (err: any) {
      addToast({
        title: "Error",
        description: err.message || "Failed to submit application",
        color: "danger",
        size: "lg",
      });
    }
  };

  if (jobsLoading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Spinner size="lg" />
        </div>
      </DefaultLayout>
    );
  }

  if (jobsError) {
    return (
      <DefaultLayout>
        <div>Error: {jobsError}</div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-4">Jobs Board</h1>
        {selectedJob ? (
          <>
            <h2 className="text-2xl mb-2">Edit Job</h2>
            <JobInput
              onSubmit={updateExistingJob}
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
            <h2 className="text-2xl mb-2">Create New Job</h2>
            <JobInput onSubmit={createNewJob} />
          </>
        )}

        <JobList
          jobs={jobs || []}
          currentUserID={user?.userID || ""}
          onEdit={setSelectedJob}
          onDelete={deleteExistingJob}
          onApply={handleApply}
        />

        <Modal isOpen={applyModalOpen} onClose={() => setApplyModalOpen(false)}>
          <ModalContent>
            <ModalHeader>Apply for Job</ModalHeader>
            <ModalBody>
              <Textarea
                label="Why are you interested?"
                placeholder="Enter your application message..."
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" color="danger" onPress={() => setApplyModalOpen(false)}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmitApplication}>
                Submit Application
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DefaultLayout>
  );
};

export default Jobs;

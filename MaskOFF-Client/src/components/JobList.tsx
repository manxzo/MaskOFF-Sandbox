import { Button } from "@heroui/react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/react";

// What a job looks like in our app
interface Job {
  jobID: string;
  title: string;
  description: string;
  price: number;
  contractPeriod: string;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    userID: string;
    username: string;
    publicInfo: {
      bio: string;
    };
  };
}

// Props needed for the job list
interface JobListProps {
  jobs: Job[];
  currentUserID: string;
  onEdit: (job: Job) => void;
  onDelete: (jobID: string) => void;
  onApply: (jobID: string) => void;
}

const JobList = ({ jobs, currentUserID, onEdit, onDelete, onApply }: JobListProps) => {
  // Check if the current user created this job
  const isJobAuthor = (job: Job) => {
    return job.user.userID === currentUserID;
  };

  // Make dates look nice and readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      {/* Loop through all jobs and show them as cards */}
      {jobs?.map((job) => (
        <Card key={job.jobID}>
          {/* Job header with title and poster info */}
          <CardHeader>
            <h2>Job Title: {job.title}</h2>
            <div>
              Posted by: {job.user.username}
            </div>
          </CardHeader>

          {/* Job details section */}
          <CardBody>
            <h3>Job Description: {job.description}</h3>
            <p>Contract Period (Days): {job.contractPeriod}</p>
            <p>Job Price: ${job.price}</p>
            <p>Last Updated: {formatDate(job.updatedAt)}</p>
          </CardBody>

          {/* Action buttons - show different ones based on ownership */}
          <CardFooter>
            {isJobAuthor(job) ? (
              <>
                <Button variant="flat" onPress={() => onEdit(job)}>
                  Edit
                </Button>
                <Button variant="ghost" onPress={() => onDelete(job.jobID)}>
                  Delete
                </Button>
              </>
            ) : (
              <Button 
                variant="solid" 
                onPress={() => onApply(job.jobID)}
                disabled={job.isComplete}
              >
                {job.isComplete ? "Job Completed" : "Apply Now"}
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default JobList; 
import { useState } from "react";
import {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
} from "@/services/services";

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

const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getJobs();
      setJobs(res.data.jobs || res.data);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Error fetching jobs");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createNewJob = async (data: JobFormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createJob(data);
      const newJob = res.data.job || res.data;
      setJobs(prev => [newJob, ...prev]);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Error creating job");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateExistingJob = async (jobID: string, data: Partial<JobFormData>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateJob(jobID, data);
      const updatedJob = res.data.job || res.data;
      setJobs(prev => prev.map(job => (job.jobID === jobID ? updatedJob : job)));
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Error updating job");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteExistingJob = async (jobID: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await deleteJob(jobID);
      setJobs(prev => prev.filter(job => job.jobID !== jobID));
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Error deleting job");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    jobs,
    loading,
    error,
    fetchJobs,
    createNewJob,
    updateExistingJob,
    deleteExistingJob,
    setJobs,
    setError,
    setLoading,
  };
};

export default useJobs; 
import { useState } from "react";
import { Button } from "@heroui/react";
import { Card } from "@heroui/react";
import { Input } from "@heroui/react";
import { Textarea } from "@heroui/react";

// Shape of our job form data
interface JobFormData {
  title: string;
  description: string;
  price: number;
  contractPeriod: string;
}

// Props that this component accepts
interface JobInputProps {
  onSubmit: (data: JobFormData) => Promise<void>;
  initialData?: JobFormData;  // Optional data for editing existing jobs
  submitLabel?: string;  // Custom label for the submit button
}

// The main form component for creating/editing jobs
const JobInput = ({ onSubmit, initialData, submitLabel = "Create Job" }: JobInputProps) => {
  // Keep track of form values
  const [formData, setFormData] = useState<JobFormData>(
    initialData || {
      title: "",
      description: "",
      price: 0,
      contractPeriod: "",
    }
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    // Only reset the form if we're creating a new job
    if (!initialData) {
      setFormData({
        title: "",
        description: "",
        price: 0,
        contractPeriod: "",
      });
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        {/* Job title input */}
        <div>
          <span>Title</span>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
        </div>

        {/* Job description textarea */}
        <div>
          <span>Description</span>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />
        </div>

        {/* Price input - needs to be a number */}
        <div>
          <span>Price</span>
          <Input
            id="price"
            type="number"
            value={formData.price.toString()} // Fix for type error
            onChange={(e) =>
              setFormData({ ...formData, price: Number(e.target.value) })
            }
            required
          />
        </div>

        {/* Contract period input */}
        <div>
          <span>Contract Period</span>
          <Input
            id="contractPeriod"
            value={formData.contractPeriod}
            onChange={(e) =>
              setFormData({
                ...formData,
                contractPeriod: e.target.value,
              })
            }
            required
          />
        </div>

        {/* Submit button */}
        <div>
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </Card>
  );
};

export default JobInput; 
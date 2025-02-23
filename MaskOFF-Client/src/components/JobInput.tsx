import { useState } from "react";
import { Button } from "@heroui/react";
import { Card } from "@heroui/react";
import { Input } from "@heroui/react";
import { Textarea } from "@heroui/react";

interface JobFormData {
  title: string;
  description: string;
  price: number;
  contractPeriod: string;
}

interface JobInputProps {
  onSubmit: (data: JobFormData) => Promise<void>;
  initialData?: JobFormData;
  submitLabel?: string;
}

const JobInput = ({ onSubmit, initialData, submitLabel = "Create Job" }: JobInputProps) => {
  const [formData, setFormData] = useState<JobFormData>(
    initialData || {
      title: "",
      description: "",
      price: 0,
      contractPeriod: "",
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    if (!initialData) {
      // Reset form only if it's not being used for editing
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
        <div>
          <span>Price</span>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: Number(e.target.value) })
            }
            required
          />
        </div>
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
        <div>
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </Card>
  );
};

export default JobInput; 
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AdminPageLoaderProps {
  message: string;
}

const AdminPageLoader = ({ message }: AdminPageLoaderProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6 text-gray-600 flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{message}</span>
      </CardContent>
    </Card>
  );
};

export default AdminPageLoader;

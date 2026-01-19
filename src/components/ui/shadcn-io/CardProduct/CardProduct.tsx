import { StarIcon } from "lucide-react";
import { Button } from "@repo/shadcn-ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@repo/shadcn-ui/components/ui/card";
export default function CardProduct() {
  return (
    <div className="w-full flex justify-center">
      <Card className="w-68 py-3">
        <CardContent className="px-3 text-center">
          <div className="aspect-square rounded-md bg-gray-100 mb-2">
            <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
              Product Image
            </div>
          </div>
          <CardTitle className="text-sm mb-1">Wireless Headphones</CardTitle>
          <CardDescription className="text-xs mb-2 line-clamp-2">
            title
          </CardDescription>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">$199</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

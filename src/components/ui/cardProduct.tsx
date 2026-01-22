import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@repo/shadcn-ui/components/ui/card";
export default function CardProduct() {
  return (
    <div className="w-full flex justify-center">
      <Card className="w-68 py-3">
        <CardContent className="px-3 text-center">
          <div className="aspect-square rounded-md bg-gray-100 mb-2">
            <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
              Image
            </div>
          </div>
          <CardTitle className="text-sm mb-1">Jung Cheyoon</CardTitle>
          <CardDescription className="text-xs mb-2 line-clamp-2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium
            suscipit ea accusamus pariatur numquam eaque recusandae laboriosam
            impedit sequi ut.
          </CardDescription>
          <CardFooter className="flex justify-center gap-3 px-3">
            <span className="text-sm font-bold">Github</span>
            <span className="text-sm font-bold">Linkdin</span>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
}

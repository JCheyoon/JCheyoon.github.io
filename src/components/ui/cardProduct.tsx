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
          <section>
            <h1 className="text-2xl font-bold tracking-wide pb-1 ">WELCOME</h1>
          </section>
          <CardTitle className="text-sm mb-1">Jung Cheyoon</CardTitle>
          <CardDescription className="flex text-xs pb-3">
            Sharing what I learn while building software.
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

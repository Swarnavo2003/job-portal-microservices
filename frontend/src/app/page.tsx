import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="p-2 space-y-2">
      <h1 className="text-xl font-bold">Home Page</h1>
      <Button variant={"outline"} size={"sm"}>
        Click Me
      </Button>
    </div>
  );
}

import Chat from "../components/chat";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export default function Home() {
  return (
    <main className="w-full flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-bold mb-4">
        Persona <AutoAwesomeIcon />{" "}
      </h1>
      <Chat />
    </main>
  );
}

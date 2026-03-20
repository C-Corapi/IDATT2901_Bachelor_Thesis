import { Navbar } from "../components/layout/Navbar";
import { Page } from "../components/layout/Page";
import { AppRoutes } from "./routes";

export function App() {
  return (
    <>
      <Navbar />
      <Page>
        <AppRoutes />
      </Page>
    </>
  );
}
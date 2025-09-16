import { Outlet } from "react-router-dom";
import FileUpload from "../components/FileUpload";

function Upload() {
  return (
    <main className="container">
      <Outlet />
      <FileUpload />
    </main>
  );
}

export default Upload;
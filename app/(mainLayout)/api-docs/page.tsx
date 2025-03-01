"use client";
import "swagger-ui-react/swagger-ui.css";
import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Loader from "@/app/_components/loader";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

interface SwaggerUIWrapperProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  spec: any;
}

const SwaggerUIWrapper = ({ spec }: SwaggerUIWrapperProps) => {
  if (!spec) return null;
  return <SwaggerUI spec={spec} />;
};

export default function ApiDocs() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    axios
      .get("/api/swagger")
      .then((response) => setSpec(response.data))
      .catch((err) => console.error("Failed to load Swagger spec", err));
  }, []);

  if (!spec) {
    return(<div className="min-h-[69vh] flex items-center justify-center">
      <Loader />
    </div>);
  }

  return <SwaggerUIWrapper spec={spec} />;
}

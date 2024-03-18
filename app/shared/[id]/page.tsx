import { type FetchSuccess } from "@/app/types";
import { Result } from "@/app/[data]/Result";
import { kv } from "@vercel/kv";

interface Props {
  params: { id: string };
}

export default async function SharedPage({ params: { id } }: Props) {
  const data = await kv.get<FetchSuccess>(id);

  if (data === null) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:border-red-700 dark:text-red-100"
        role="alert"
      >
        <p>
          <b>Error</b> shared link{" "}
          <code
            className="text-sm bg-red-200 dark:bg-red-600 dark:text-gray-200 px-1 py-0.5 rounded
            "
          >
            {id}
          </code>
          : does not exist
        </p>
      </div>
    );
  }

  return <Result data={data} />;
}

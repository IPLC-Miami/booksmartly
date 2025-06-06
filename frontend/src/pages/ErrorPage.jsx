import ErrorElement from "../ui/ErrorElement";

export default function ErrorPage({ title, text, type }) {
  return (
    <div className="absolute inset-0 h-[93svh] flex items-center justify-center">
      <ErrorElement text={text} title={title} type={type} />
    </div>
  );
}


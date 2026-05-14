type Props = {
  message: string;
};

export function Toast({ message }: Props) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-[#232428] border border-white/10 text-white px-4 py-3 rounded-lg shadow-lg z-50">
      {message}
    </div>
  );
}

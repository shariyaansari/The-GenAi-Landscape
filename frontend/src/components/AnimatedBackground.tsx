export default function AnimatedBackground() {
  return (
    <>
      <div className="fixed inset-0 -z-20 bg-app-gradient" aria-hidden />
      <div className="particles -z-10" aria-hidden />
    </>
  );
}

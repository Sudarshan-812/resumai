export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-12 text-center text-gray-400">
      <div className="max-w-6xl mx-auto px-4">
        <p className="mb-4">
          Built by <span className="text-white font-semibold">Sudarshan</span> using Next.js 15 
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <a href="#" className="hover:text-indigo-400 transition-colors">Twitter</a>
          <a href="#" className="hover:text-indigo-400 transition-colors">LinkedIn</a>
          <a href="https://github.com/Sudarshan-812/ai-resume" className="hover:text-indigo-400 transition-colors">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
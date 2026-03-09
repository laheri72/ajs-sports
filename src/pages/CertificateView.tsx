import { useParams } from "react-router-dom";
import { useCertificationById } from "@/hooks/useCertifications";
import { Award, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

export default function CertificateView() {
  const { id } = useParams<{ id: string }>();
  const { data: cert, isLoading } = useCertificationById(id || "");
  const certRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Certificate not found.</p>
      </div>
    );
  }

  const handlePrint = () => window.print();

  const levelLabel = cert.proficiency_level.toUpperCase();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Print button */}
      <div className="max-w-3xl mx-auto mb-4 flex justify-end print:hidden">
        <Button onClick={handlePrint} className="gap-2">
          <Download className="w-4 h-4" /> Print / Save PDF
        </Button>
      </div>

      {/* Certificate */}
      <div
        ref={certRef}
        className="max-w-3xl mx-auto bg-card border-4 border-double border-primary/40 rounded-2xl p-8 md:p-12 print:border-black print:rounded-none"
      >
        {/* Decorative border inner */}
        <div className="border-2 border-primary/20 rounded-xl p-6 md:p-10 space-y-8 text-center">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                <Award className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-xl md:text-2xl font-display font-bold tracking-[0.2em] text-foreground uppercase">
              Al Jamea Tus Saifiyah
            </h1>
            <p className="text-sm text-muted-foreground uppercase tracking-[0.15em]">Sports Department</p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-primary/30" />
            <Award className="w-5 h-5 text-primary/50" />
            <div className="flex-1 h-px bg-primary/30" />
          </div>

          {/* Title */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Certificate of</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-primary">
              Sports Proficiency
            </h2>
          </div>

          {/* Body */}
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">This certifies that</p>
            <h3 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-wide">
              {cert.profiles?.full_name?.toUpperCase() || "—"}
            </h3>
            <p className="text-sm text-muted-foreground">has achieved</p>
            <div className="inline-block">
              <span className="text-2xl md:text-3xl font-display font-bold text-accent tracking-wider">
                {levelLabel} LEVEL
              </span>
            </div>
            <p className="text-sm text-muted-foreground">in</p>
            <h4 className="text-xl md:text-2xl font-display font-semibold text-foreground">
              {cert.sports?.name}
            </h4>
            <p className="text-sm text-muted-foreground mt-6">
              Based on performance evaluation and sports development<br />
              for the year <span className="font-semibold text-foreground">{cert.valid_year}</span>.
            </p>
          </div>

          {/* Score */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-sm">
            <span className="text-muted-foreground">Proficiency Score:</span>
            <span className="font-display font-bold text-foreground">{cert.score_snapshot}/100</span>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-primary/30" />
            <Award className="w-5 h-5 text-primary/50" />
            <div className="flex-1 h-px bg-primary/30" />
          </div>

          {/* Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4 text-xs text-muted-foreground">
            <div className="text-center md:text-left">
              <p className="font-medium text-foreground">Sports Department</p>
              <p>Al Jamea Tus Saifiyah</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-primary">{cert.certificate_number}</p>
              <p className="mt-1">{new Date(cert.issued_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <div className="text-center md:text-right">
              <p className="font-medium text-foreground">Issued by</p>
              <p>{cert.issuer?.full_name || "Sports Department"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

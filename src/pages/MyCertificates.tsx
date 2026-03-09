import { motion } from "framer-motion";
import { Award, Eye, Download } from "lucide-react";
import { useMyCertifications } from "@/hooks/useCertifications";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const levelColors: Record<string, string> = {
  advanced: "bg-primary/20 text-primary",
  expert: "bg-accent/20 text-accent",
  master: "bg-success/20 text-success",
};

export default function MyCertificates() {
  const { data: certs, isLoading } = useMyCertifications();

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Award className="w-6 h-6 text-primary" /> My Certificates
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Your official sports proficiency certificates.</p>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !certs?.length ? (
        <motion.div variants={item}>
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <Award className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No certificates yet. Keep training and competing to earn your first certification!</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certs.map(cert => (
            <Card key={cert.id} className="glass-card overflow-hidden hover:border-primary/30 transition-colors">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-bold text-foreground">{cert.sports?.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Year {cert.valid_year}</p>
                  </div>
                  <Badge variant="secondary" className={cn("text-xs capitalize", levelColors[cert.proficiency_level])}>
                    {cert.proficiency_level}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Score</span>
                  <span className="font-display font-bold text-foreground">{cert.score_snapshot}/100</span>
                </div>
                <p className="font-mono text-xs text-primary">{cert.certificate_number}</p>
                <Link to={`/certificates/${cert.id}`}>
                  <Button size="sm" variant="outline" className="w-full gap-1">
                    <Eye className="w-3 h-3" /> View Certificate
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

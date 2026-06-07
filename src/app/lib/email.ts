import { Resend } from "resend";

const FROM = "Column8 <noreply@column8.ai>";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendPaymentReceiptEmail(params: {
  to: string;
  creditsAdded: number;
  planUpgraded: string | null;
  paymentId: string;
}) {
  const resend = getResend();
  if (!resend) return;
  const { to, creditsAdded, planUpgraded, paymentId } = params;
  const planLine = planUpgraded
    ? `<p>Your account has been upgraded to <strong>${planUpgraded.charAt(0).toUpperCase() + planUpgraded.slice(1)}</strong>.</p>`
    : "";

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Column8 — ${creditsAdded} credits added`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#111111">
        <h2 style="font-size:20px;margin-bottom:8px">Payment confirmed</h2>
        <p>You've received <strong>${creditsAdded} credits</strong> on Column8.</p>
        ${planLine}
        <p style="color:#6B6860;font-size:13px">Payment ID: ${paymentId}</p>
        <hr style="border:none;border-top:1px solid #E5E3DC;margin:24px 0"/>
        <p style="font-size:12px;color:#9B9890">Column8 · AI Resume Analysis</p>
      </div>
    `,
  });
}

export async function sendAnalysisDoneEmail(params: {
  to: string;
  fileName: string;
  atsScore: number;
  resumeId: string;
}) {
  const resend = getResend();
  if (!resend) return;
  const { to, fileName, atsScore, resumeId } = params;
  const grade = atsScore >= 85 ? "Strong" : atsScore >= 65 ? "Good" : "Needs work";
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${resumeId}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Column8 — ATS Score: ${atsScore}/100 for ${fileName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#111111">
        <h2 style="font-size:20px;margin-bottom:8px">Resume analysis complete</h2>
        <p><strong>${fileName}</strong> scored <strong>${atsScore}/100</strong> (${grade}).</p>
        <a href="${dashboardUrl}"
           style="display:inline-block;margin-top:16px;padding:10px 20px;background:#06b6d4;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
          View Full Report
        </a>
        <hr style="border:none;border-top:1px solid #E5E3DC;margin:24px 0"/>
        <p style="font-size:12px;color:#9B9890">Column8 · AI Resume Analysis</p>
      </div>
    `,
  });
}

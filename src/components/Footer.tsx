// Footer – same content and markup as condaotrip.com.vn. Never restyle it (see lessons.md).
import { useState, type FormEvent } from "react";
import { BANK, COMPANY, FOOTER_CTA_BG, HOTLINES, LINKS, PAYMENT_LOGOS, PHONE_MAIN, QR_CODES, SOCIALS } from "../data/contact";
import { useI18n } from "../i18n/I18nProvider";
import { Phone, Shield } from "./ui/Icons";

export function Footer() {
  const { t } = useI18n();
  const [msg, setMsg] = useState("");

  function subscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector("input");
    if (!input) return;
    if (!input.checkValidity()) { input.reportValidity(); return; }
    // Demo: plug in the real newsletter endpoint here
    console.log("Newsletter", input.value);
    setMsg(t("footer.emailOk"));
    form.reset();
  }

  return (
    <footer className="site-footer">
      <section className="container footer-cta-wrap">
        <div className="footer-cta">
          <img className="footer-cta-bg" src={FOOTER_CTA_BG} alt="" aria-hidden="true" loading="lazy" />
          <div className="footer-cta-grid">
            <div>
              <h2>{t("footer.ctaTitle")}</h2>
              <div className="shimmer-line"></div>
              <p>{t("footer.ctaText")}</p>
              <div className="footer-cta-chips">
                <span><Shield /><em>{t("footer.ctaChip1")}</em></span>
                <span><Shield /><em>{t("footer.ctaChip2")}</em></span>
              </div>
            </div>
            <div className="footer-hotline">
              <p>{t("footer.hotline")}</p>
              {HOTLINES.map((h) => <a key={h.tel} href={"tel:" + h.tel}>{h.label}</a>)}
              <a href={"tel:" + PHONE_MAIN.tel} className="footer-call"><Phone /><span>{t("footer.call")}</span></a>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="footer-main">
          <div className="footer-col-3">
            <h3>{t("footer.newsletter")}</h3>
            <form className="newsletter" id="newsletter" onSubmit={subscribe}>
              <input type="email" required placeholder={t("footer.emailPh")} />
              <button type="submit">{t("footer.sendEmail")}</button>
              <p className="newsletter-msg" role="status">{msg}</p>
            </form>
          </div>
          <div className="footer-col-6">
            <h3>{t("footer.qr")}</h3>
            <div className="qr-grid">
              {QR_CODES.map((q) => (
                <div className="qr" key={q.alt}>
                  <div className="qr-img"><img src={q.src} alt={q.alt} width={200} height={200} loading="lazy" /></div>
                  <div className="qr-name"><b>{q.bank}</b><span>{q.owner}</span></div>
                </div>
              ))}
            </div>
          </div>
          <div className="footer-col-3">
            <h3 className="center">{t("footer.social")}</h3>
            <div className="social-grid">
              {SOCIALS.map((s) => (
                <a key={s.name} href={s.href} target="_blank" rel="noreferrer" aria-label={s.name} title={s.name}>
                  <img src={s.icon} alt={s.name} width={34} height={34} loading="lazy" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-pay">
          <p>{t("footer.payAccept")}</p>
          <div className="footer-pay-logos">
            {PAYMENT_LOGOS.map((p) => <img key={p.alt} src={p.src} alt={p.alt} width={p.width} height={30} loading="lazy" />)}
          </div>
        </div>

        <div className="footer-info">
          <div className="footer-company">
            <div className="footer-company-logo"><img src={COMPANY.logo} alt="Côn Đảo Trip logo" width={128} height={128} loading="lazy" /></div>
            <div className="footer-company-text">
              <p className="upper">{COMPANY.name[0]}<br />{COMPANY.name[1]}</p>
              <p><b>{t("footer.brand")}</b>{" " + COMPANY.brand}</p>
              <p><b>{t("footer.tax")}</b>{" " + COMPANY.tax}</p>
              <p><b>{t("footer.license")}</b>{" " + COMPANY.license}</p>
              <p><b>Website:</b>{" " + COMPANY.websites}</p>
              <p><b>Email:</b> <a href={"mailto:" + COMPANY.email}>{COMPANY.email}</a></p>
            </div>
          </div>
          <div className="footer-bank">
            <p className="upper">{BANK.title}</p>
            <p><b>{BANK.heading}</b></p>
            <p>{BANK.accountName}</p>
            <p>{BANK.accountNumber}</p>
            <p>{BANK.bankName[0]}<br />{BANK.bankName[1]}</p>
            <p>{BANK.swift}</p>
            <p>{BANK.address[0]}<br />{BANK.address[1]}</p>
          </div>
        </div>

        <div className="footer-copy">
          <span>© <span id="year">{new Date().getFullYear()}</span>{" " + COMPANY.copyright}</span>
          <a href={LINKS.sitemap} target="_blank" rel="noopener">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}

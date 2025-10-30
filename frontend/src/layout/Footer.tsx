// src/components/Footer.tsx
const Footer = () => {
  const dt = new Date(__BUILD_DATE__);
  const dataPT = new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Lisbon",
  }).format(dt);

  return (
    <div className="border-t bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40 w-full text-center text-[10px] py-1 text-muted-foreground">
      Data de lançamento: {dataPT} ({__BUILD_COMMIT__})
    </div>
  );
};

export default Footer;

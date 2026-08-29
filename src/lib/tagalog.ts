export const tl = {
  feedback: {
    button: "Mag-feedback",
    title: "Makipag-ugnayan sa amin",
    subtitle: "Magtanong o mag-iwan ng mensahe — tutugon kami agad.",
    placeholder: "Isulat ang mensahe mo dito…",
    namePlaceholder: "Pangalan (opsyonal)",
    emailPlaceholder: "Email (opsyonal)",
    send: "Ipadala",
    sending: "Ipinapadala…",
    typing: "Sumusulat ang support…",
    empty: "Wala pang mensahe. Magtanong tungkol sa produkto, order, o delivery.",
    sent: "Naipadala na ang mensahe mo!",
    error: "May error. Subukan muli.",
    autoReply:
      "Salamat sa mensahe mo! Natanggap na namin ito at tutugon kami sa lalong madaling panahon. Karaniwang tumutugon kami sa loob ng 1 oras sa office hours (Lunes–Biyernes, 9 AM–6 PM).",
    online: "Online ngayon",
  },
  toast: {
    addedToCart: (name: string) => `${name} naidagdag sa cart mo`,
    orderPlaced: (id: string) => `Na-place na ang order ${id}`,
    validationError: "Pakitingnan ang mga field na may error",
    orderUpdated: (id: string, status: string) => `${id} naka-mark na bilang ${status}`,
    feedbackSent: "Salamat! Natanggap na ang feedback mo.",
    replySent: "Naipadala na ang sagot sa customer.",
  },
} as const;

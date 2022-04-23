const data = [
  {
    id: "orders",
    icon: "iconsminds-receipt-4",
    label: "dashboards.orders",
    to: "/app/orders/list",
  },
  {
    id: "scheduler",
    icon: "iconsminds-map2",
    label: "menu.scheduler",
    to: "/app/scheduler",
  },
  {
    id: "clients",
    icon: "simple-icon-people",
    label: "menu.clients",
    to: "/app/clients/list",
  },
  {
    id: "technicians",
    icon: "simple-icon-people",
    label: "menu.technicians",
    to: "/app/users/list",
  },
  // {
  //   id: "service_categories",
  //   icon: "simple-icon-layers",
  //   label: "menu.service_categories",
  //   to: "/",
  //   subs: [
  //     {
  //       icon: "simple-icon-layers",
  //       label: "menu.service_categories",
  //       to: "/app/service_categories/list",
  //     },
  //     {
  //       icon: "simple-icon-people",
  //       label: "menu.addons",
  //       to: "/app/addons/list",
  //     },
  //   ],
  // },
  {
    id: "settings",
    icon: "simple-icon-settings",
    label: "menu.settings",
    to: "/",
    subs: [
      {
        icon: "iconsminds-map2",
        label: "menu.cities",
        to: "/app/cities/list",
      },
      {
        icon: "simple-icon-layers",
        label: "menu.service_categories",
        to: "/app/service_categories/list",
      },
      {
        icon: "simple-icon-people",
        label: "menu.addons",
        to: "/app/addons/list",
      },
    ],
  },
  {
    id: "ui",
    icon: "iconsminds-pantone",
    label: "menu.ui",
    to: "/app/ui",
    subs: [
      {
        id: "ui-forms",
        label: "menu.forms",
        to: "/app/ui/forms",
        subs: [
          {
            icon: "simple-icon-notebook",
            label: "menu.layouts",
            to: "/app/ui/forms/layouts",
          },
          {
            icon: "simple-icon-puzzle",
            label: "menu.components",
            to: "/app/ui/forms/components",
          },
          {
            icon: "simple-icon-check",
            label: "menu.validations",
            to: "/app/ui/forms/validations",
          },
          {
            icon: "simple-icon-magic-wand",
            label: "menu.wizard",
            to: "/app/ui/forms/wizard",
          },
        ],
      },
      {
        id: "ui-components",
        label: "menu.components",
        to: "/app/ui/components",
        subs: [
          {
            icon: "simple-icon-bell",
            label: "menu.alerts",
            to: "/app/ui/components/alerts",
          },
          {
            icon: "simple-icon-badge",
            label: "menu.badges",
            to: "/app/ui/components/badges",
          },
          {
            icon: "simple-icon-control-play",
            label: "menu.buttons",
            to: "/app/ui/components/buttons",
          },
          {
            icon: "simple-icon-layers",
            label: "menu.cards",
            to: "/app/ui/components/cards",
          },
          {
            icon: "simple-icon-picture",
            label: "menu.carousel",
            to: "/app/ui/components/carousel",
          },
          {
            icon: "simple-icon-chart",
            label: "menu.charts",
            to: "/app/ui/components/charts",
          },
          {
            icon: "simple-icon-arrow-up",
            label: "menu.collapse",
            to: "/app/ui/components/collapse",
          },
          {
            icon: "simple-icon-arrow-down",
            label: "menu.dropdowns",
            to: "/app/ui/components/dropdowns",
          },
          {
            icon: "simple-icon-book-open",
            label: "menu.editors",
            to: "/app/ui/components/editors",
          },

          {
            icon: "simple-icon-star",
            label: "menu.icons",
            to: "/app/ui/components/icons",
          },
          {
            icon: "simple-icon-note",
            label: "menu.input-groups",
            to: "/app/ui/components/input-groups",
          },
          {
            icon: "simple-icon-screen-desktop",
            label: "menu.jumbotron",
            to: "/app/ui/components/jumbotron",
          },
          {
            icon: "simple-icon-map",
            label: "menu.maps",
            to: "/app/ui/components/maps",
          },
          {
            icon: "simple-icon-docs",
            label: "menu.modal",
            to: "/app/ui/components/modal",
          },
          {
            icon: "simple-icon-cursor",
            label: "menu.navigation",
            to: "/app/ui/components/navigation",
          },
          {
            icon: "simple-icon-pin",
            label: "menu.popover-tooltip",
            to: "/app/ui/components/popover-tooltip",
          },
          {
            icon: "simple-icon-shuffle",
            label: "menu.sortable",
            to: "/app/ui/components/sortable",
          },
          {
            icon: "simple-icon-grid",
            label: "menu.tables",
            to: "/app/ui/components/tables",
          },
        ],
      },
    ],
  },
  {
    id: "dashboards",
    icon: "iconsminds-shop-4",
    label: "menu.dashboards",
    to: "/app/dashboards",
    subs: [
      {
        icon: "simple-icon-briefcase",
        label: "menu.default",
        to: "/app/dashboards/default",
      },
    ],
  },
];

if (localStorage.getItem("user_default_role") === "Admin") {
  data.map((single_menu) => {
    if (single_menu.id === "settings") {
      single_menu.subs.push({
        icon: "simple-icon-people",
        label: "menu.csr",
        to: "/app/csr/list",
      });
    }
  });
}

export default data;

import React from 'react';

import * as Icon from 'react-feather';

export const SidebarData = [
          
    {
        label: "Main",
        submenuOpen: true,
        showSubRoute: false,
        submenuHdr: "Main",
        submenuItems: [
        {
            label: "Dashboard",
            icon: <Icon.Grid  />,
            submenu: true,
            showSubRoute: false,

            submenuItems: [
              { label: "Admin Dashboard", link: "/" },
            ]
          },
        ]
      },
      {
        label: "Orders List",
        submenuOpen: true,
        showSubRoute: false,
        submenuHdr: "Orders List",
        submenuItems: [
          { label: "Orders", link: "/orders", icon: <Icon.ShoppingCart />,showSubRoute: false,submenu: false },
        ]
      },
      {
        label: "Inventory",
        submenuOpen: true,
        showSubRoute: false,
        submenuHdr: "Inventory",
      
        submenuItems: [
          { label: "Products", link: "/product-list", icon:<Icon.Box />,showSubRoute: false,submenu: false },
          { label: "Create Product", link: "/add-product", icon:  <Icon.PlusSquare />,showSubRoute: false, submenu: false },
          { label: "Category", link: "/category-list", icon:  <Icon.Codepen />,showSubRoute: false,submenu: false },
          { label: "Variant Attributes", link: "/variant-attributes", icon:  <Icon.Layers />,showSubRoute: false,submenu: false },
        ]
      },
      {
        label: "Promo",
        submenuOpen: true,
        submenuHdr: "Promo",
        showSubRoute: false,
        submenuItems: [
          { label: "Coupons", link: "/coupons", icon:  <Icon.ShoppingCart />,showSubRoute: false, submenu: false }
        ]
      },
      {
        label: "User Management",
        submenuOpen: true,
        showSubRoute: false,
        submenuHdr: "User Management",
        submenuItems: [
          { label: "Users", link: "/users", icon:  <Icon.UserCheck />,showSubRoute: false },
        ]
      },
      {
        label: "Settings",
        submenu: true,
        showSubRoute: false,
        submenuHdr: "Settings",
        submenuItems: [
          { label: "Logout", link: "/signin", icon:  <Icon.LogOut />,showSubRoute: false }
        ]
      },
]

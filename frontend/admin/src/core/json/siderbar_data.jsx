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
        label: "Stock",
        submenuOpen: true,
        submenuHdr: "Stock",
        submenu: true,
        showSubRoute: false,
        submenuItems: [
          { label: "Manage Stock", link: "/manage-stocks", icon:  <Icon.Package />,showSubRoute: false,submenu: false },
          { label: "Stock Adjustment", link: "/stock-adjustment", icon:  <Icon.Clipboard />,showSubRoute: false,submenu: false },
          { label: "Stock Transfer", link: "/stock-transfer", icon:  <Icon.Truck />,showSubRoute: false,submenu: false }
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
        label: "Purchases",
        submenuOpen: true,
        submenuHdr: "Purchases",
        showSubRoute: false,
        submenuItems: [
          { label: "Purchases", link: "/purchase-list", icon:  <Icon.ShoppingBag />,showSubRoute: false,submenu: false },
          { label: "Purchase Order", link: "/purchase-order-report", icon:  <Icon.FileMinus />,showSubRoute: false ,submenu: false},
          { label: "Purchase Return", link: "/purchase-returns", icon:  <Icon.RefreshCw />,showSubRoute: false,submenu: false }
        ]
      },
      
      {
        label: "HRM",
        submenuOpen: true,
        showSubRoute: false,
        submenuHdr: "HRM",
        submenuItems: [
          { label: "Employees", link: "/employees-grid", icon:  <Icon.Users />,showSubRoute: false },
          { label: "Departments", link: "/department-grid", icon:  <Icon.User />,showSubRoute: false },
          { label: "Designations", link: "/designation", icon:  <Icon.UserCheck />,showSubRoute: false }
          
        ],
      },
      {
        label: "User Management",
        submenuOpen: true,
        showSubRoute: false,
        submenuHdr: "User Management",
        submenuItems: [
          { label: "Users", link: "/users", icon:  <Icon.UserCheck />,showSubRoute: false },
          { label: "Roles & Permissions", link: "/roles-permissions", icon:  <Icon.UserCheck />,showSubRoute: false },
          { label: "Delete Account Request", link: "/delete-account", icon:  <Icon.Lock />,showSubRoute: false }
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

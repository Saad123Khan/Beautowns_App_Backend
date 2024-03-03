import asyncHandler from "#middlewares/asyncHandler";
import { Booking } from "#models/booking_model";
import _ from "lodash";
import { StoreCategories } from "#models/store_categories_model";
import { Service } from "#models/services_model";
import { Staffs } from "#models/staff_model";

import { User } from "#models/user_model";

const getAllAnalytics = asyncHandler(async (req, res) => {
  const allBookings = await Booking.find({ store_Id: req.params.id });
  let totalAppointments = 0;
  let completedAppointments = 0;
  let notCompletedAppointments = 0;
  let cancelledAppointments = 0;
  let onlineAppointments = 0;
  let onSiteAppointments = 0;
  let totalSales = 0;
  let totalDiscount = 0;
  let totalRating = 0;
  let totalCheckIns = 0;
  let paymentCompletedNotCheckInAppointments = 0;
  let totalWithStaffAppointments = 0;
  let returningClients = 0;
  let newClients = 0;

  let totalPendingSales = 0;

  let totalPendingDiscount = 0;

  const uniqueUserIds = new Set();
  const returningClientUserIds = new Set();

  allBookings?.forEach((booking) => {
    console.log(booking);
    if (!booking.isSessionExpired && booking.paymentDone) {
      totalAppointments++;

      if (booking.user_Id) {
        uniqueUserIds.add(booking.user_Id);
        // Check for returning clients
        if (uniqueUserIds.has(booking.user_Id)) {
          returningClients++;
          returningClientUserIds.add(booking.user_Id);
        } else {
          newClients++;
        }
      }

      if (booking.isCancel) {
        cancelledAppointments++;
      }

      if (booking.paymentDone && booking.isCheckIn) {
        completedAppointments++;
        totalSales += booking.amount;

        if (booking.coupons_Id) {
          totalDiscount += booking.discount;
        }
      }

      if (booking.paymentDone && !booking.isCheckIn) {
        paymentCompletedNotCheckInAppointments++;
        notCompletedAppointments++;
        totalPendingSales += booking.amount;

        if (booking.coupons_Id) {
          totalPendingDiscount += booking.discount;
        }
      }

      if (booking.isCheckIn) {
        totalCheckIns++;
      }
      if (booking.booking_type === "auto") {
        onlineAppointments++;
      }
      if (booking.salon_staff_Id) {
        totalWithStaffAppointments++;
      }

      if (booking.booking_type === "manual") {
        onSiteAppointments++;
      }

      if (booking.rating) {
        totalRating += booking.rating;
      }
    }
  });

  const averageSale =
    totalAppointments - cancelledAppointments > 0
      ? totalSales / (totalAppointments - cancelledAppointments)
      : 0;

  const averageRating =
    totalAppointments > 0
      ? totalRating > 0
        ? totalRating / totalAppointments
        : 0
      : 0;

  const percentageCompletedAppointments =
    totalAppointments > 0
      ? (completedAppointments / totalAppointments) * 100
      : 0;

  const percentageNotCompletedAppointments =
    totalAppointments > 0
      ? (notCompletedAppointments / totalAppointments) * 100
      : 0;

  const percentageCancelledAppointments =
    totalAppointments > 0
      ? (cancelledAppointments / totalAppointments) * 100
      : 0;

  const percentageOnlineAppointments =
    totalAppointments > 0 ? (onlineAppointments / totalAppointments) * 100 : 0;

  const percentageOnSiteAppointments =
    totalAppointments > 0 ? (onSiteAppointments / totalAppointments) * 100 : 0;

  const percentagePaymentCompletedNotCheckInAppointments =
    totalAppointments > 0
      ? (paymentCompletedNotCheckInAppointments / totalAppointments) * 100
      : 0;

  const clientRetention =
    uniqueUserIds.size > 0
      ? (returningClientUserIds.size / uniqueUserIds.size) * 100
      : 0;

  const percentageReturningClients =
    uniqueUserIds.size > 0
      ? (returningClientUserIds.size / uniqueUserIds.size) * 100
      : 0;

  const analyticsData = {
    totalAppointments,
    completedAppointments,
    percentageCompletedAppointments,
    paymentCompletedNotCheckInAppointments,
    percentagePaymentCompletedNotCheckInAppointments,
    notCompletedAppointments,
    percentageNotCompletedAppointments,
    cancelledAppointments,
    percentageCancelledAppointments,
    totalWithStaffAppointments,
    onlineAppointments,
    percentageOnlineAppointments,
    onSiteAppointments,
    percentageOnSiteAppointments,
    totalSales,
    totalPendingDiscount,
    totalPendingSales,
    averageSale,
    averageRating,
    totalDiscount,
    totalCheckIns,
    clientRetention,
    returningClients,
    newClients,
    percentageReturningClients,
  };

  return res.status(200).json(analyticsData);
});

const getGraphsData = asyncHandler(async (req, res) => {
  const requestedYear = req.query.year
    ? parseInt(req.query.year)
    : new Date().getFullYear();

  const allCategories = await StoreCategories.find({ store_Id: req.params.id });
  const allStaffs = await Staffs.find({ store_Id: req.params.id });
  const allServices = await Service.find({ store_Id: req.params.id });

  const servicesNames = allServices.map((staff) => staff.name);
  const staffsNames = allStaffs.map((staff) => staff.name);
  const categoryNames = allCategories.map((category) => category.name);
  const allBookings = await Booking.find({ store_Id: req.params.id }).populate({
    path: "service_Ids",
    populate: { path: "service_category_Id" },
  });

  const currentDate = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(currentDate.getMonth() - 11);

  const monthlyEarnings = Array(12).fill(0);
  const yearlyEarnings = {};
  const categoryCounts = {};
  const categoryCountsPercentage = {};
  const monthlyBookingCounts = Array(12).fill(0);
  const staffBookingCounts = {};
  const staffBookingPercentage = {};
  const serviceCounts = {};
  const servicePercentage = {};
  let totalBookings = 0;

  categoryNames.forEach((categoryName) => {
    categoryCounts[categoryName] = 0;
  });

  staffsNames.forEach((staffName) => {
    staffBookingCounts[staffName] = 0;
  });

  servicesNames.forEach((serviceName) => {
    serviceCounts[serviceName] = 0;
  });

  for (const booking of allBookings) {
    const bookingDate = new Date(booking.createdAt);

    if (booking.paymentDone && booking.isCheckIn) {
      totalBookings++;
      // Monthly Earnings
      if (bookingDate.getFullYear() === requestedYear) {
        const monthIndex = bookingDate.getMonth();

        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyEarnings[monthIndex] += booking.amount;
          monthlyBookingCounts[monthIndex]++;
        }
      }

      // Yearly Earnings
      if (!yearlyEarnings[bookingDate.getFullYear()]) {
        yearlyEarnings[bookingDate.getFullYear()] = 0;
      }
      yearlyEarnings[bookingDate.getFullYear()] += booking.amount;

      // Category Counts
      booking.service_Ids.forEach((service) => {
        const categoryName = service.service_category_Id.name;
        if (categoryCounts.hasOwnProperty(categoryName)) {
          categoryCounts[categoryName]++;
        }
      });

      // Staff Booking Counts
      const staffFind = await Staffs.findById(
        booking.salon_staff_Id.toString()
      );
      const staffName = staffFind?.name;
      if (!staffBookingCounts[staffName]) {
        staffBookingCounts[staffName] = 0;
      }
      staffBookingCounts[staffName]++;

      booking.service_Ids.forEach((service) => {
        const serviceName = service.name;
        console.log(serviceName);
        if (serviceCounts.hasOwnProperty(serviceName)) {
          serviceCounts[serviceName]++;
        }
      });
    }
  }
  if (totalBookings > 0) {
    Object.keys(categoryCounts).forEach((categoryName) => {
      const count = categoryCounts[categoryName];
      categoryCountsPercentage[categoryName] = (count / totalBookings) * 100;
    });

    Object.keys(staffBookingCounts).forEach((staffName) => {
      const count = staffBookingCounts[staffName];
      staffBookingPercentage[staffName] = (count / totalBookings) * 100;
    });

    Object.keys(serviceCounts).forEach((serviceName) => {
      const count = serviceCounts[serviceName];
      servicePercentage[serviceName] = (count / totalBookings) * 100;
    });
  } else {
    Object.keys(categoryCounts).forEach((categoryName) => {
      categoryCountsPercentage[categoryName] = 0;
    });

    Object.keys(staffBookingCounts).forEach((staffName) => {
      staffBookingPercentage[staffName] = 0;
    });

    Object.keys(serviceCounts).forEach((serviceName) => {
      servicePercentage[serviceName] = 0;
    });
  }

  const analyticsData = {
    monthlyEarnings,
    monthlyBookingCounts,
    yearlyEarnings,
    categoryCounts,
    staffBookingCounts,
    serviceCounts,
    servicePercentage,
    categoryCountsPercentage,
    staffBookingPercentage,
  };

  return res.status(200).json(analyticsData);
});

const getAdminAnalytics = asyncHandler(async (req, res) => {
  const allBookings = await Booking.find();
  let totalAppointments = 0;
  let completedAppointments = 0;
  let notCompletedAppointments = 0;
  let cancelledAppointments = 0;
  let onlineAppointments = 0;
  let onSiteAppointments = 0;
  let totalSales = 0;
  let totalDiscount = 0;
  let totalRating = 0;
  let totalCheckIns = 0;
  let paymentCompletedNotCheckInAppointments = 0;
  let totalWithStaffAppointments = 0;
  let returningClients = 0;
  let newClients = 0;

  let totalPendingSales = 0;

  let totalPendingDiscount = 0;

  const uniqueUserIds = new Set();
  const returningClientUserIds = new Set();

  allBookings?.forEach((booking) => {
    console.log(booking);
    if (!booking.isSessionExpired && booking.paymentDone) {
      totalAppointments++;

      if (booking.user_Id) {
        uniqueUserIds.add(booking.user_Id);
        // Check for returning clients
        if (uniqueUserIds.has(booking.user_Id)) {
          returningClients++;
          returningClientUserIds.add(booking.user_Id);
        } else {
          newClients++;
        }
      }

      if (booking.isCancel) {
        cancelledAppointments++;
      }

      if (booking.paymentDone && booking.isCheckIn) {
        completedAppointments++;
        totalSales += booking.amount;

        if (booking.coupons_Id) {
          totalDiscount += booking.discount;
        }
      }

      if (booking.paymentDone && !booking.isCheckIn) {
        paymentCompletedNotCheckInAppointments++;
        notCompletedAppointments++;
        totalPendingSales += booking.amount;

        if (booking.coupons_Id) {
          totalPendingDiscount += booking.discount;
        }
      }

      if (booking.isCheckIn) {
        totalCheckIns++;
      }
      if (booking.booking_type === "auto") {
        onlineAppointments++;
      }
      if (booking.salon_staff_Id) {
        totalWithStaffAppointments++;
      }

      if (booking.booking_type === "manual") {
        onSiteAppointments++;
      }

      if (booking.rating) {
        totalRating += booking.rating;
      }
    }
  });

  const averageSale =
    totalAppointments - cancelledAppointments > 0
      ? totalSales / (totalAppointments - cancelledAppointments)
      : 0;

  const averageRating =
    totalAppointments > 0
      ? totalRating > 0
        ? totalRating / totalAppointments
        : 0
      : 0;

  const percentageCompletedAppointments =
    totalAppointments > 0
      ? (completedAppointments / totalAppointments) * 100
      : 0;

  const percentageNotCompletedAppointments =
    totalAppointments > 0
      ? (notCompletedAppointments / totalAppointments) * 100
      : 0;

  const percentageCancelledAppointments =
    totalAppointments > 0
      ? (cancelledAppointments / totalAppointments) * 100
      : 0;

  const percentageOnlineAppointments =
    totalAppointments > 0 ? (onlineAppointments / totalAppointments) * 100 : 0;

  const percentageOnSiteAppointments =
    totalAppointments > 0 ? (onSiteAppointments / totalAppointments) * 100 : 0;

  const percentagePaymentCompletedNotCheckInAppointments =
    totalAppointments > 0
      ? (paymentCompletedNotCheckInAppointments / totalAppointments) * 100
      : 0;

  const clientRetention =
    uniqueUserIds.size > 0
      ? (returningClientUserIds.size / uniqueUserIds.size) * 100
      : 0;

  const percentageReturningClients =
    uniqueUserIds.size > 0
      ? (returningClientUserIds.size / uniqueUserIds.size) * 100
      : 0;

  const analyticsData = {
    totalAppointments,
    completedAppointments,
    percentageCompletedAppointments,
    paymentCompletedNotCheckInAppointments,
    percentagePaymentCompletedNotCheckInAppointments,
    notCompletedAppointments,
    percentageNotCompletedAppointments,
    cancelledAppointments,
    percentageCancelledAppointments,
    totalWithStaffAppointments,
    onlineAppointments,
    percentageOnlineAppointments,
    onSiteAppointments,
    percentageOnSiteAppointments,
    totalSales,
    totalPendingDiscount,
    totalPendingSales,
    averageSale,
    averageRating,
    totalDiscount,
    totalCheckIns,
    clientRetention,
    returningClients,
    newClients,
    percentageReturningClients,
  };

  return res.status(200).json(analyticsData);
});

const getAdminData = asyncHandler(async (req, res) => {
  const requestedYear = req.query.year
    ? parseInt(req.query.year)
    : new Date().getFullYear();

  const allCategories = await StoreCategories.find();
  const allStaffs = await Staffs.find();
  const allServices = await Service.find();
  const servicesNames = allServices.map((staff) => staff.name);
  const staffsNames = allStaffs.map((staff) => staff.name);
  const categoryNames = allCategories.map((category) => category.name);
  const allBookings = await Booking.find().populate({
    path: "service_Ids",
    populate: { path: "service_category_Id" },
  });

  const currentDate = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(currentDate.getMonth() - 11);

  const monthlyEarnings = Array(12).fill(0);
  const yearlyEarnings = {};
  const categoryCounts = {};
  const categoryCountsPercentage = {};
  const monthlyBookingCounts = Array(12).fill(0);
  const staffBookingCounts = {};
  const staffBookingPercentage = {};
  const serviceCounts = {};
  const servicePercentage = {};
  let totalBookings = 0;

  categoryNames.forEach((categoryName) => {
    categoryCounts[categoryName] = 0;
  });

  staffsNames.forEach((staffName) => {
    staffBookingCounts[staffName] = 0;
  });

  servicesNames.forEach((serviceName) => {
    serviceCounts[serviceName] = 0;
  });

  for (const booking of allBookings) {
    const bookingDate = new Date(booking.createdAt);

    if (booking.paymentDone && booking.isCheckIn) {
      totalBookings++;
      // Monthly Earnings
      if (bookingDate.getFullYear() === requestedYear) {
        const monthIndex =  bookingDate.getMonth();

        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyEarnings[monthIndex] += booking.amount;
          monthlyBookingCounts[monthIndex]++;
        }
      }

      // Yearly Earnings
      if (!yearlyEarnings[bookingDate.getFullYear()]) {
        yearlyEarnings[bookingDate.getFullYear()] = 0;
      }
      yearlyEarnings[bookingDate.getFullYear()] += booking.amount;

      // Category Counts
      booking.service_Ids.forEach((service) => {
        const categoryName = service.service_category_Id.name;
        if (categoryCounts.hasOwnProperty(categoryName)) {
          categoryCounts[categoryName]++;
        }
      });

      // Staff Booking Counts
      const staffFind = await Staffs.findById(
        booking.salon_staff_Id.toString()
      );
      const staffName = staffFind?.name;
      if (!staffBookingCounts[staffName]) {
        staffBookingCounts[staffName] = 0;
      }
      staffBookingCounts[staffName]++;

      booking.service_Ids.forEach((service) => {
        const serviceName = service.name;
        console.log(serviceName);
        if (serviceCounts.hasOwnProperty(serviceName)) {
          serviceCounts[serviceName]++;
        }
      });
    }
  }
  if (totalBookings > 0) {
    Object.keys(categoryCounts).forEach((categoryName) => {
      const count = categoryCounts[categoryName];
      categoryCountsPercentage[categoryName] = (count / totalBookings) * 100;
    });

    Object.keys(staffBookingCounts).forEach((staffName) => {
      const count = staffBookingCounts[staffName];
      staffBookingPercentage[staffName] = (count / totalBookings) * 100;
    });

    Object.keys(serviceCounts).forEach((serviceName) => {
      const count = serviceCounts[serviceName];
      servicePercentage[serviceName] = (count / totalBookings) * 100;
    });
  } else {
    Object.keys(categoryCounts).forEach((categoryName) => {
      categoryCountsPercentage[categoryName] = 0;
    });

    Object.keys(staffBookingCounts).forEach((staffName) => {
      staffBookingPercentage[staffName] = 0;
    });

    Object.keys(serviceCounts).forEach((serviceName) => {
      servicePercentage[serviceName] = 0;
    });
  }

  const analyticsData = {
    monthlyEarnings,
    monthlyBookingCounts,
    yearlyEarnings,
    categoryCounts,
    staffBookingCounts,
    serviceCounts,
    servicePercentage,
    categoryCountsPercentage,
    staffBookingPercentage,
  };

  return res.status(200).json(analyticsData);
});

export { getAllAnalytics, getGraphsData, getAdminAnalytics, getAdminData };

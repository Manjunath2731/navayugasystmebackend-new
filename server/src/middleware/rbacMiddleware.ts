import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { UserRole } from '../models/User';
import { IUser } from '../models/User';

// Check if user has required roles
export const requireRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // Check if user has any of the required roles
    if (!roles.includes((req.user as IUser).role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

// Check if user has access to specific dashboards
export const requireDashboardAccess = (dashboardIds: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // Convert to array if single dashboard ID
    const requiredDashboards = Array.isArray(dashboardIds) ? dashboardIds : [dashboardIds];

    // Check if user has access to all required dashboards
    const hasAccess = requiredDashboards.every(dashboardId => 
      (req.user as IUser).dashboards.includes(dashboardId)
    );

    if (!hasAccess) {
      return next(new ForbiddenError('Insufficient dashboard permissions'));
    }

    next();
  };
};

// Check if user is owner
export const requireOwner = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if ((req.user as IUser).role !== UserRole.OWNER) {
      return next(new ForbiddenError('Owner access required'));
    }

    next();
  };
};

// Check if user is front desk employee
export const requireFrontDesk = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if ((req.user as IUser).role !== UserRole.FRONT_DESK) {
      return next(new ForbiddenError('Front desk access required'));
    }

    next();
  };
};

// Check if user is field officer
export const requireFieldOfficer = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if ((req.user as IUser).role !== UserRole.FIELD_OFFICER) {
      return next(new ForbiddenError('Field officer access required'));
    }

    next();
  };
};

// Check if user has any of the specified roles
export const requireAnyRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes((req.user as IUser).role)) {
      return next(new ForbiddenError('Access denied for your role'));
    }

    next();
  };
};
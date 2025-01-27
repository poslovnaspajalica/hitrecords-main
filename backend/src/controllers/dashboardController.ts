import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboardService';

export const getDeliveryMetrics = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const metrics = await dashboardService.getDeliveryMetrics(
      dateFrom as string,
      dateTo as string
    );
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching delivery metrics:', error);
    res.status(500).json({ message: 'Error fetching delivery metrics' });
  }
};

export const getProviderMetrics = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const metrics = await dashboardService.getProviderMetrics(
      dateFrom as string,
      dateTo as string
    );
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching provider metrics:', error);
    res.status(500).json({ message: 'Error fetching provider metrics' });
  }
};

export const getDailyMetrics = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const metrics = await dashboardService.getDailyMetrics(days);
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching daily metrics:', error);
    res.status(500).json({ message: 'Error fetching daily metrics' });
  }
};

export const getLocationMetrics = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const metrics = await dashboardService.getLocationMetrics(
      dateFrom as string,
      dateTo as string
    );
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching location metrics:', error);
    res.status(500).json({ message: 'Error fetching location metrics' });
  }
};

export const getIssueMetrics = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const metrics = await dashboardService.getIssueMetrics(
      dateFrom as string,
      dateTo as string
    );
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching issue metrics:', error);
    res.status(500).json({ message: 'Error fetching issue metrics' });
  }
};

export const getPerformanceMetrics = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const metrics = await dashboardService.getPerformanceMetrics(
      dateFrom as string,
      dateTo as string
    );
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ message: 'Error fetching performance metrics' });
  }
};

export const getStatusDistribution = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const distribution = await dashboardService.getStatusDistribution(
      dateFrom as string,
      dateTo as string
    );
    res.json(distribution);
  } catch (error) {
    console.error('Error fetching status distribution:', error);
    res.status(500).json({ message: 'Error fetching status distribution' });
  }
};

export const getDeliveryTimeDistribution = async (req: Request, res: Response) => {
  try {
    const distribution = await dashboardService.getDeliveryTimeDistribution();
    res.json(distribution);
  } catch (error) {
    console.error('Error fetching delivery time distribution:', error);
    res.status(500).json({ message: 'Error fetching delivery time distribution' });
  }
};

export const getShipmentTrends = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const trends = await dashboardService.getShipmentTrends(days);
    res.json(trends);
  } catch (error) {
    console.error('Error fetching shipment trends:', error);
    res.status(500).json({ message: 'Error fetching shipment trends' });
  }
};

export const getDeliveryPerformanceTrends = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const trends = await dashboardService.getDeliveryPerformanceTrends(days);
    res.json(trends);
  } catch (error) {
    console.error('Error fetching delivery performance trends:', error);
    res.status(500).json({ message: 'Error fetching delivery performance trends' });
  }
}; 
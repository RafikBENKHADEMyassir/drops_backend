import express, { Request, Response } from 'express';
import postalDropController from '../controllers/postal-drop.controller';
import { authenticateUser } from '../middleware/authMiddleware';

const router = express.Router();

// Protect all postal drop routes with authentication
router.use(authenticateUser);

// Create a new postal drop draft
router.post('/', (req: Request, res: Response) => {
  postalDropController.createDraft(req, res);
});

// Get postal drop by ID
router.get('/:id', (req: Request, res: Response) => {
  postalDropController.getById(req, res);
});

// Update entire postal drop
router.put('/:id', (req: Request, res: Response) => {
  postalDropController.updatePostalDrop(req, res);
});

// Update postal drop design (front or back)
router.put('/:id/design', (req: Request, res: Response) => {
  postalDropController.updateDesign(req, res);
});

// Update recipient address - new endpoint
router.put('/:id/recipient-address', (req: Request, res: Response) => {
  postalDropController.updateRecipientAddress(req, res);
});

// Update sender address - new endpoint
router.put('/:id/sender-address', (req: Request, res: Response) => {
  postalDropController.updateSenderAddress(req, res);
});

// Update personal message - new endpoint
router.put('/:id/personal-message', (req: Request, res: Response) => {
  postalDropController.updatePersonalMessage(req, res);
});

// Update postal drop address (recipient or sender) - existing endpoint
router.put('/:id/address', (req: Request, res: Response) => {
  postalDropController.updateAddress(req, res);
});

// Update personal message - existing endpoint
router.put('/:id/message', (req: Request, res: Response) => {
  postalDropController.updateMessage(req, res);
});

// Get all postal drops for current user
router.get('/', (req: Request, res: Response) => {
  postalDropController.getUserPostalDrops(req, res);
});

// Delete a postal drop (only allowed for drafts)
router.delete('/:id', (req: Request, res: Response) => {
  postalDropController.deletePostalDrop(req, res);
});

export default router;
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";

const CollaboratorInvite = ({ task, onInvite }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleInvite = () => {
    if (!email.match(/^[^\s@]+@[^\\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    onInvite(email, message);
    setEmail("");
    setMessage("");
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Invite Collaborator
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white text-gray-900 dark:bg-slate-800 dark:text-gray-100 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle>Invite Collaborator</DialogTitle>
            <DialogDescription>
              Enter the email address of the collaborator you want to invite to <b>{task?.name}</b>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="collaborator@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
                className="bg-white text-gray-900 border border-gray-300 dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600"
              />
            </div>
            <div>
              <Label htmlFor="invite-message">Message (optional)</Label>
              <Input
                id="invite-message"
                type="text"
                placeholder="Add a personal message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="bg-white text-gray-900 border border-gray-300 dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600"
              />
            </div>
            {error && <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite}>Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CollaboratorInvite; 
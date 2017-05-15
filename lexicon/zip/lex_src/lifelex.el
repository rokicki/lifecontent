;;; lifelex.el --- Life Lexicon mode

;; Copyright (C) 2000 Stephen Silver

;; This program is free software; you can redistribute it and/or
;; modify it under the terms of the GNU General Public License as
;; published by the Free Software Foundation; either version 2 of
;; the License, or (at your option) any later version.

;; This program is distributed in the hope that it will be
;; useful, but WITHOUT ANY WARRANTY; without even the implied
;; warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
;; PURPOSE.  See the GNU General Public License for more details.

;; You should have received a copy of the GNU General Public
;; License along with this program; if not, write to the Free
;; Software Foundation, Inc., 59 Temple Place, Suite 330, Boston,
;; MA 02111-1307 USA

;;; Commentary:

;; See details in emacs.txt.

;;; Code:

(put 'lifelex-mode 'mode-class 'special)

;; mode map stuff
(defvar lifelex-mode-map
  (let ((map (make-sparse-keymap)))
    (define-key map "\C-m" 'lifelex-ret)  ; rebind RET
    (define-key map "\177" 'lifelex-del)  ; rebind DEL
    (define-key map [mouse-2] 'lifelex-mouse-follow-xref)
    (define-key map [menu-bar lifelex]
      (cons "Lexicon" (make-sparse-keymap "Life Lexicon")))
    (define-key map [menu-bar lifelex find-definition]
      '("Find Definition" . lifelex-find-definition))
    (define-key map [menu-bar lifelex go-back]
      '("Go Back" . lifelex-go-back))
    (define-key map [menu-bar lifelex follow-xref]
      '("Follow Cross-Reference" . lifelex-follow-xref))
    (define-key map [menu-bar lifelex run-pattern]
      '("Run Pattern" . lifelex-run-pattern))
    map)
  "Key mappings for Life Lexicon mode.")

;; font lock stuff
(defface lifelex-headword-face
  '((t (:foreground "yellow")))
  "Face for Life Lexicon headwords.")
(defface lifelex-xref-face
  '((t (:foreground "spring green")))
  "Face for Life Lexicon cross-references.")
(defface lifelex-diagram-face
  '((t (:foreground "RosyBrown2")))
  "Face for Life Lexicon diagrams.")
(defvar lifelex-mode-font-lock-keywords
  (list
   '("^:\\([^:]+\\):" . '(1 'lifelex-headword-face nil nil))
   '( "{\\([^}]+\\)}" . '(1 'lifelex-xref-face nil nil))
   '("^.\\([*.]+\\)$" . '(1 'lifelex-diagram-face nil nil))
   ))

;; user variables
(defvar lifelex-tmpfile "c:/sas/life/LIFE 1.06/lex_tmp.lif"
  "Temporary file for running Life patterns.")
(defvar lifelex-lifeapp "c:/Program Files/Life32/Life32.exe"
  "Command used to invoke Life simulator.")

;; load LifeLex mode
;;;###autoload
(defun lifelex-mode ()
  "Switch on Life Lexicon mode."
  (interactive)
  (kill-all-local-variables)
  (make-local-variable 'font-lock-defaults)
  (make-local-variable 'font-lock-keywords)
  (make-local-variable 'lifelex-go-back-stack)
  (setq major-mode 'lifelex-mode
	mode-name "Life-Lexicon"
	lifelex-go-back-stack ()
	font-lock-defaults '(lifelex-mode-font-lock-keywords t nil nil nil)
	buffer-read-only t
	case-fold-search t)
  (use-local-map lifelex-mode-map)
  (run-hooks 'lifelex-mode-hook))

(defun lifelex-go-to-definition (string)
  "Go to the definition of the specified term, if not nil."
  (when string
    (setq lifelex-go-back-stack
	  (cons (cons (window-start) (point))
		lifelex-go-back-stack))
    (goto-char (point-min))
    (if (search-forward (concat ":" string ":") nil t)
	(progn
	  (beginning-of-line)
	  (set-window-start (selected-window) (point)))
      (lifelex-go-back)
      (error "Cross-reference failed!"))))

(defun lifelex-find-definition (string)
  "Find a definition in the Life Lexicon."
  (interactive "MFind definition: ")
  (setq lifelex-go-back-stack
	(cons (cons (window-start) (point))
	      lifelex-go-back-stack))
  (goto-char (point-min))
  (if (search-forward-regexp (concat "^:" (regexp-quote string)) nil t)
      (progn
	(beginning-of-line)
	(set-window-start (selected-window) (point)))
    (lifelex-go-back)
    (error "No matching definition")))

(defun lifelex-get-keyword ()
  "Return the keyword that is cross-referenced at the current point."
  (let (q (p (point)))
    (while (and (char-after p) (not (eq (char-after p) ?\})))
      (setq p (+ p 1)))
    (when (char-after p)
      (setq q p)
      (while (and (char-after q) (not (eq (char-after q) ?\{)))
	(setq q (- q 1)))
      (if (char-after q)
	  (buffer-substring (+ q 1) p)))))

(defun lifelex-follow-xref ()
  "Follow a cross-reference."
  (interactive)
  (lifelex-go-to-definition (lifelex-get-keyword)))

(defun lifelex-mouse-follow-xref (click)
  "Follow a cross-reference using the mouse."
  (interactive "e")
  (goto-char (car (cdr (event-start click))))
  (lifelex-go-to-definition (lifelex-get-keyword)))

(defun lifelex-go-back ()
  "Go back to last position"
  (interactive)
  (if (not lifelex-go-back-stack)
      (error "Nothing to go back to!")
    (let ((cc (car lifelex-go-back-stack)))
      (setq lifelex-go-back-stack (cdr lifelex-go-back-stack))
      (goto-char (cdr cc))
      (set-window-start (selected-window) (car cc)))))

(defun lifelex-ret ()
  "Follow a cross-reference or enter a newline, depending on read-only status."
  (interactive)
  (if buffer-read-only
      (lifelex-follow-xref)
    (newline)))

(defun lifelex-del (n)
  "Go back to last position or delete a char, depending on read-only status."
  (interactive "p")
  (if buffer-read-only
      (lifelex-go-back)
    (delete-backward-char n (not (eq n 1)))))

(defun lifelex-is-a-pattern-line ()
  "Tests if point is the beginning of a pattern line."
  (looking-at "^.\\([*.]+\\)$"))

(defun lifelex-run-pattern ()
  "Run the pattern at or after point."
  (interactive)
  (let (p (saved-point (point)) fname)
    (beginning-of-line)
    (catch 'lifelex-catch
      (while (not (lifelex-is-a-pattern-line))
	(if (not (eq 0 (forward-line 1))) (throw 'lifelex-catch t)))
      (while (lifelex-is-a-pattern-line)
	(if (not (eq 0 (forward-line -1))) (throw 'lifelex-catch t)))
      (forward-line 1)
      (setq p (point))
      (while (lifelex-is-a-pattern-line)
	(if (not (eq 0 (forward-line 1))) (throw 'lifelex-catch t)))
      (setq fname (expand-file-name lifelex-tmpfile temporary-file-directory))
      (write-region p (point) fname)
      (call-process lifelex-lifeapp nil 0 nil
		    (convert-standard-filename fname)))
    (goto-char saved-point)))

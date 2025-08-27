
'use client';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TablePaginationProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
}

export function TablePagination({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: TablePaginationProps) {
  const totalPages = Math.ceil(count / rowsPerPage);

  const handleFirstPage = () => {
    onPageChange(0);
  };

  const handlePreviousPage = () => {
    onPageChange(page - 1);
  };

  const handleNextPage = () => {
    onPageChange(page + 1);
  };

  const handleLastPage = () => {
    onPageChange(totalPages - 1);
  };

  return (
    <div className="flex items-center justify-end space-x-6 lg:space-x-8 text-sm text-muted-foreground">
      <div className="flex items-center space-x-2">
        <p className="font-medium">Rows per page</p>
        <Select
          value={`${rowsPerPage}`}
          onValueChange={(value) => {
            onRowsPerPageChange(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={rowsPerPage} />
          </SelectTrigger>
          <SelectContent side="top">
            {[25, 50, 75].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex w-[100px] items-center justify-center font-medium">
        Page {page + 1} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={handleFirstPage}
          disabled={page === 0}
        >
          <span className="sr-only">Go to first page</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={handlePreviousPage}
          disabled={page === 0}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={handleNextPage}
          disabled={page >= totalPages - 1}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={handleLastPage}
          disabled={page >= totalPages - 1}
        >
          <span className="sr-only">Go to last page</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
